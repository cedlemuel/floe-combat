import pool from "../db/pool.js";

import type { Highlight } from "../types/highlight.js";
import type {
  CreateHighlightInput,
  UpdateHighlightInput,
} from "../types/highlightInput.js";

const highlightColumns = `
  id::integer AS id,
  title,
  athlete,
  media_type,
  media_url,
  media_public_id,
  thumbnail_url,
  thumbnail_public_id,
  created_at,
  updated_at
`;

const getAllHighlights = async (): Promise<Highlight[]> => {
  const result = await pool.query<Highlight>(`
    SELECT ${highlightColumns}
    FROM highlights
    ORDER BY created_at DESC
  `);

  return result.rows;
};

const createHighlight = async (
  input: CreateHighlightInput,
): Promise<Highlight> => {
  const result = await pool.query<Highlight>(
    `
      INSERT INTO highlights (
        title,
        athlete,
        media_type,
        media_url,
        media_public_id,
        thumbnail_url,
        thumbnail_public_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING ${highlightColumns}
    `,
    [
      input.title,
      input.athlete,
      input.mediaType,
      input.mediaUrl,
      input.mediaPublicId,
      input.thumbnailUrl ?? null,
      input.thumbnailPublicId ?? null,
    ],
  );

  const highlight = result.rows[0];

  if (!highlight) {
    throw new Error("Highlight was not returned after creation.");
  }

  return highlight;
};

const getHighlightById = async (id: number): Promise<Highlight | null> => {
  const result = await pool.query<Highlight>(
    `
      SELECT ${highlightColumns}
      FROM highlights
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] ?? null;
};

const updateHighlight = async (
  id: number,
  input: UpdateHighlightInput,
): Promise<Highlight | null> => {
  const result = await pool.query<Highlight>(
    `
      UPDATE highlights
      SET
        title = $1,
        athlete = $2,
        media_type = $3,
        media_url = $4,
        media_public_id = $5,
        thumbnail_url = $6,
        thumbnail_public_id = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING ${highlightColumns}
    `,
    [
      input.title,
      input.athlete,
      input.mediaType,
      input.mediaUrl,
      input.mediaPublicId,
      input.thumbnailUrl,
      input.thumbnailPublicId,
      id,
    ],
  );

  return result.rows[0] ?? null;
};

const deleteHighlightById = async (id: number): Promise<Highlight | null> => {
  const result = await pool.query<Highlight>(
    `
      DELETE FROM highlights
      WHERE id = $1
      RETURNING ${highlightColumns}
    `,
    [id],
  );

  return result.rows[0] ?? null;
};

export {
  getAllHighlights,
  createHighlight,
  getHighlightById,
  updateHighlight,
  deleteHighlightById,
};
