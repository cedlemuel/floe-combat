import pool from "../db/pool.js";

const isCloudinaryAssetReferenced = async (
  publicId: string,
): Promise<boolean> => {
  const result = await pool.query<{
    is_referenced: boolean;
  }>(
    `
      SELECT (
        EXISTS (
          SELECT 1
          FROM product_images
          WHERE image_public_id = $1
        )
        OR
        EXISTS (
          SELECT 1
          FROM highlights
          WHERE media_public_id = $1
             OR thumbnail_public_id = $1
        )
      ) AS is_referenced
    `,
    [publicId],
  );

  return result.rows[0]?.is_referenced ?? false;
};

export { isCloudinaryAssetReferenced };
