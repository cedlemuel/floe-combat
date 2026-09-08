import pool from "../db/pool.js";
import type {
  Product,
  NewProductImage,
  ProductImage,
} from "../types/product.js";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "../types/productInput.js";

const productColumns = `
  p.id,
  p.title,
  p.category,
  p.subcategory,
  p.description,
  p.sizes,
  p.created_at,
  p.updated_at
`;

const productImagesColumn = `
  COALESCE(
    JSON_AGG(
      JSON_BUILD_OBJECT(
        'id', pi.id,
        'product_id', pi.product_id,
        'image_url', pi.image_url,
        'image_public_id', pi.image_public_id,
        'is_primary', pi.is_primary,
        'sort_order', pi.sort_order,
        'created_at', pi.created_at
      )
      ORDER BY pi.sort_order, pi.id
    ) FILTER (WHERE pi.id IS NOT NULL),
    '[]'::JSON
  ) AS images
`;

const productSelect = `
  SELECT
    ${productColumns},
    ${productImagesColumn}
  FROM products p
  LEFT JOIN product_images pi
    ON pi.product_id = p.id
`;

const getAllProducts = async (): Promise<Product[]> => {
  const result = await pool.query<Product>(`
    ${productSelect}
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `);

  return result.rows;
};

const createProduct = async (
  input: CreateProductInput,
  images: NewProductImage[],
): Promise<Product> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query<{ id: number }>(
      `
    INSERT INTO products (
      title,
      category,
      subcategory,
      description,
      sizes
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `,
      [
        input.title,
        input.category,
        input.subcategory,
        input.description,
        input.sizes,
      ],
    );

    const product = result.rows[0];

    if (!product) {
      throw new Error("Product was not returned after creation.");
    }

    for (const [index, image] of images.entries()) {
      await client.query(
        `
          INSERT INTO product_images (
            product_id,
            image_url,
            image_public_id,
            is_primary,
            sort_order
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          product.id,
          image.image_url,
          image.image_public_id,
          index === 0,
          index,
        ],
      );
    }

    await client.query("COMMIT");

    const createdProduct = await getProductById(product.id);

    if (!createdProduct) {
      throw new Error("Product was not found after creation.");
    }

    return createdProduct;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const deleteProductById = async (id: number): Promise<Product | null> => {
  const product = await getProductById(id);

  if (!product) {
    return null;
  }

  await pool.query(
    `
      DELETE FROM products
      WHERE id = $1
    `,
    [id],
  );

  return product;
};

const getProductById = async (id: number): Promise<Product | null> => {
  const result = await pool.query<Product>(
    `
      ${productSelect}
      WHERE p.id = $1
      GROUP BY p.id
    `,
    [id],
  );

  return result.rows[0] ?? null;
};

const updateProduct = async (
  id: number,
  input: UpdateProductInput,
  newImages: NewProductImage[],
  deletedImageIds: number[],
): Promise<{
  product: Product;
  deletedImages: ProductImage[];
} | null> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
    UPDATE products
    SET
      title = $1,
      category = $2,
      subcategory = $3,
      description = $4,
      sizes = $5,
      updated_at = NOW()
    WHERE id = $6
    RETURNING id
  `,
      [
        input.title,
        input.category,
        input.subcategory,
        input.description,
        input.sizes,
        id,
      ],
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const deletedImages: ProductImage[] = [];

    if (deletedImageIds.length > 0) {
      const deletedResult = await client.query<ProductImage>(
        `
          DELETE FROM product_images
          WHERE
            product_id = $1
            AND id = ANY($2::integer[])
          RETURNING *
        `,
        [id, deletedImageIds],
      );

      deletedImages.push(...deletedResult.rows);
    }

    const orderResult = await client.query<{ max_order: number }>(
      `
        SELECT COALESCE(MAX(sort_order), -1)::integer AS max_order
        FROM product_images
        WHERE product_id = $1
      `,
      [id],
    );

    let sortOrder = (orderResult.rows[0]?.max_order ?? -1) + 1;

    for (const image of newImages) {
      await client.query(
        `
          INSERT INTO product_images (
            product_id,
            image_url,
            image_public_id,
            is_primary,
            sort_order
          )
          VALUES ($1, $2, $3, false, $4)
        `,
        [id, image.image_url, image.image_public_id, sortOrder],
      );

      sortOrder++;
    }

    // Make sure the product always has one primary image
    await client.query(
      `
        UPDATE product_images
        SET is_primary = false
        WHERE product_id = $1
      `,
      [id],
    );

    await client.query(
      `
        UPDATE product_images
        SET is_primary = true
        WHERE id = (
          SELECT id
          FROM product_images
          WHERE product_id = $1
          ORDER BY sort_order, id
          LIMIT 1
        )
      `,
      [id],
    );

    await client.query("COMMIT");

    const product = await getProductById(id);

    if (!product) {
      throw new Error("Product was not found after update.");
    }

    return {
      product,
      deletedImages,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export {
  getAllProducts,
  createProduct,
  deleteProductById,
  getProductById,
  updateProduct,
};
