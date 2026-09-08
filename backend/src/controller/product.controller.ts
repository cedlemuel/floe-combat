import type { Request, Response } from "express";
import {
  cleanupProductImages,
  deleteProductImage,
} from "../service/cloudinary.service.js";
import {
  createProduct,
  getAllProducts,
  deleteProductById,
  getProductById,
  updateProduct,
} from "../service/product.service.js";
import { createAdminActivity } from "../service/adminActivity.service.js";
import {
  parseDeletedImageIds,
  parseProductImages,
  parseSizes,
  validateProductCategory,
} from "../utils/helper.js";

const getProductsController = async (_req: Request, res: Response) => {
  try {
    const products = await getAllProducts();

    res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      result: products,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not fetch products.",
    });
  }
};

const createProductController = async (req: Request, res: Response) => {
  const { title, category, subcategory, description, sizes, images } =
    req.body as Record<string, unknown>;

  if (
    typeof title !== "string" ||
    typeof category !== "string" ||
    typeof description !== "string" ||
    !title.trim() ||
    !category.trim() ||
    !description.trim()
  ) {
    res.status(400).json({
      success: false,
      message: "Title, category, and description are required.",
    });

    return;
  }

  if (
    subcategory !== undefined &&
    subcategory !== null &&
    typeof subcategory !== "string"
  ) {
    res.status(400).json({
      success: false,
      message: "Subcategory must be a string.",
    });

    return;
  }

  const parsedSubcategory =
    typeof subcategory === "string" && subcategory.trim()
      ? subcategory.trim()
      : null;

  const categoryValidation = validateProductCategory(
    category.trim(),
    parsedSubcategory,
  );

  if (!categoryValidation.valid) {
    res.status(400).json({
      success: false,
      message: categoryValidation.message,
    });

    return;
  }

  const parsedSizes = parseSizes(sizes);

  if (!parsedSizes) {
    res.status(400).json({
      success: false,
      message: "At least one valid product size is required.",
    });

    return;
  }

  const parsedImages = parseProductImages(images);

  if (!parsedImages) {
    res.status(400).json({
      success: false,
      message: "Invalid product image data.",
    });

    return;
  }

  if (parsedImages.length === 0) {
    res.status(400).json({
      success: false,
      message: "At least one product image is required.",
    });

    return;
  }

  if (parsedImages.length > 10) {
    res.status(400).json({
      success: false,
      message: "A product can have a maximum of 10 images.",
    });

    return;
  }

  try {
    const product = await createProduct(
      {
        title: title.trim(),
        category: category.trim(),
        subcategory: parsedSubcategory,
        description: description.trim(),
        sizes: parsedSizes,
      },
      parsedImages,
    );

    try {
      await createAdminActivity(
        req.admin!.adminId,
        "CREATE_PRODUCT",
        "product",
        product.id,
      );
    } catch (activityError) {
      console.error("Failed to create admin activity:", activityError);
    }

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      result: product,
    });
  } catch (error) {
    console.error(error);

    await cleanupProductImages(parsedImages);

    res.status(500).json({
      success: false,
      message: "Could not create product.",
    });
  }
};

const updateProductController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const {
    title,
    category,
    subcategory,
    description,
    sizes,
    images,
    deletedImageIds,
  } = req.body as Record<string, unknown>;

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({
      success: false,
      message: "Product ID must be a positive integer.",
    });

    return;
  }

  if (
    typeof title !== "string" ||
    typeof category !== "string" ||
    typeof description !== "string" ||
    !title.trim() ||
    !category.trim() ||
    !description.trim()
  ) {
    res.status(400).json({
      success: false,
      message: "Title, category, and description are required.",
    });

    return;
  }

  if (
    subcategory !== undefined &&
    subcategory !== null &&
    typeof subcategory !== "string"
  ) {
    res.status(400).json({
      success: false,
      message: "Subcategory must be a string.",
    });

    return;
  }

  const parsedSubcategory =
    typeof subcategory === "string" && subcategory.trim()
      ? subcategory.trim()
      : null;

  const categoryValidation = validateProductCategory(
    category.trim(),
    parsedSubcategory,
  );

  if (!categoryValidation.valid) {
    res.status(400).json({
      success: false,
      message: categoryValidation.message,
    });

    return;
  }

  const parsedSizes = parseSizes(sizes);

  if (!parsedSizes) {
    res.status(400).json({
      success: false,
      message: "At least one valid product size is required.",
    });

    return;
  }

  const parsedImages = parseProductImages(images ?? []);

  if (!parsedImages) {
    res.status(400).json({
      success: false,
      message: "Invalid product image data.",
    });

    return;
  }

  const parsedDeletedImageIds = parseDeletedImageIds(deletedImageIds);

  if (!parsedDeletedImageIds) {
    res.status(400).json({
      success: false,
      message: "Deleted image IDs must be a valid array.",
    });

    return;
  }

  try {
    const existingProduct = await getProductById(id);

    if (!existingProduct) {
      res.status(404).json({
        success: false,
        message: "Product not found.",
      });

      return;
    }

    const existingImageIds = new Set(
      existingProduct.images.map((image) => image.id),
    );

    const hasInvalidImageId = parsedDeletedImageIds.some(
      (imageId) => !existingImageIds.has(imageId),
    );

    if (hasInvalidImageId) {
      res.status(400).json({
        success: false,
        message: "One or more images do not belong to this product.",
      });

      return;
    }

    const finalImageCount =
      existingProduct.images.length -
      parsedDeletedImageIds.length +
      parsedImages.length;

    if (finalImageCount < 1) {
      res.status(400).json({
        success: false,
        message: "A product must have at least one image.",
      });

      return;
    }

    if (finalImageCount > 10) {
      res.status(400).json({
        success: false,
        message: "A product can have a maximum of 10 images.",
      });

      return;
    }

    const result = await updateProduct(
      id,
      {
        title: title.trim(),
        category: category.trim(),
        subcategory: parsedSubcategory,
        description: description.trim(),
        sizes: parsedSizes,
      },
      parsedImages,
      parsedDeletedImageIds,
    );

    if (!result) {
      throw new Error("Product was not returned after update.");
    }

    for (const image of result.deletedImages) {
      try {
        await deleteProductImage(image.image_public_id);
      } catch (cloudinaryError) {
        console.error(
          `Failed to delete old product image ${image.image_public_id}:`,
          cloudinaryError,
        );
      }
    }

    try {
      await createAdminActivity(
        req.admin!.adminId,
        "UPDATE_PRODUCT",
        "product",
        result.product.id,
      );
    } catch (activityError) {
      console.error("Failed to create admin activity:", activityError);
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      result: result.product,
    });
  } catch (error) {
    console.error(error);

    await cleanupProductImages(parsedImages);

    res.status(500).json({
      success: false,
      message: "Could not update product.",
    });
  }
};

const deleteProductController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({
      success: false,
      message: "Product ID must be a positive integer.",
    });

    return;
  }

  try {
    const deletedProduct = await deleteProductById(id);

    if (!deletedProduct) {
      res.status(404).json({
        success: false,
        message: "Product not found.",
      });

      return;
    }

    const failedImages: string[] = [];

    for (const image of deletedProduct.images) {
      try {
        await deleteProductImage(image.image_public_id);
      } catch (cloudinaryError) {
        console.error(
          `Failed to delete Cloudinary image ${image.image_public_id}:`,
          cloudinaryError,
        );

        failedImages.push(image.image_public_id);
      }
    }

    try {
      await createAdminActivity(
        req.admin!.adminId,
        "DELETE_PRODUCT",
        "product",
        deletedProduct.id,
      );
    } catch (activityError) {
      console.error("Failed to create admin activity:", activityError);
    }

    res.status(200).json({
      success: true,
      message:
        failedImages.length > 0
          ? "Product deleted, but some image cleanup failed."
          : "Product and images deleted successfully.",
      result: deletedProduct,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not delete product.",
    });
  }
};

export {
  getProductsController,
  createProductController,
  updateProductController,
  deleteProductController,
};
