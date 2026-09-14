import pool from "../db/pool.js";
import type { PoolClient } from "pg";
import type { Highlight } from "../types/highlight.js";
import type {
  CreateHighlightInput,
  HighlightMediaInput,
  UpdateHighlightInput,
} from "../types/highlightInput.js";

const highlightSelect = `
  SELECT
    h.id::integer AS id,
    h.title,
    h.athlete,
    h.created_at,
    h.updated_at,

    COALESCE(
      json_agg(
        json_build_object(
          'id', hm.id,
          'highlight_id', hm.highlight_id,
          'media_type', hm.media_type,
          'media_url', hm.media_url,
          'media_public_id', hm.media_public_id,
          'thumbnail_url', hm.thumbnail_url,
          'thumbnail_public_id', hm.thumbnail_public_id,
          'sort_order', hm.sort_order,
          'created_at', hm.created_at
        )
        ORDER BY hm.sort_order ASC, hm.id ASC
      ) FILTER (WHERE hm.id IS NOT NULL),
      '[]'::json
    ) AS media

  FROM highlights h

  LEFT JOIN highlight_media hm
    ON hm.highlight_id = h.id
`;

const insertMedia = async (
  client: PoolClient,
  highlightId: number,
  media: HighlightMediaInput[],
) => {
  for (const item of media) {
    await client.query(
      `
        INSERT INTO highlight_media (
          highlight_id,
          media_type,
          media_url,
          media_public_id,
          thumbnail_url,
          thumbnail_public_id,
          sort_order
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        highlightId,
        item.mediaType,
        item.mediaUrl,
        item.mediaPublicId,
        item.thumbnailUrl,
        item.thumbnailPublicId,
        item.sortOrder,
      ],
    );
  }
};

const getAllHighlights = async (): Promise<Highlight[]> => {
  const result = await pool.query<Highlight>(`
    ${highlightSelect}

    GROUP BY
      h.id,
      h.title,
      h.athlete,
      h.created_at,
      h.updated_at

    ORDER BY h.created_at DESC
  `);

  return result.rows;
};

const getHighlightById = async (id: number): Promise<Highlight | null> => {
  const result = await pool.query<Highlight>(
    `
      ${highlightSelect}

      WHERE h.id = $1

      GROUP BY
        h.id,
        h.title,
        h.athlete,
        h.created_at,
        h.updated_at
    `,
    [id],
  );

  return result.rows[0] ?? null;
};

const createHighlight = async (
  input: CreateHighlightInput,
): Promise<Highlight> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query<{ id: number }>(
      `
        INSERT INTO highlights (
          title,
          athlete
        )
        VALUES ($1, $2)
        RETURNING id
      `,
      [input.title, input.athlete],
    );

    const highlightId = result.rows[0]?.id;

    if (!highlightId) {
      throw new Error("Highlight was not returned after creation.");
    }

    await insertMedia(client, highlightId, input.media);

    await client.query("COMMIT");

    const highlight = await getHighlightById(highlightId);

    if (!highlight) {
      throw new Error("Highlight could not be fetched after creation.");
    }

    return highlight;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const updateHighlight = async (
  id: number,
  input: UpdateHighlightInput,
): Promise<Highlight | null> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
        UPDATE highlights
        SET
          title = $1,
          athlete = $2,
          updated_at = NOW()
        WHERE id = $3
        RETURNING id
      `,
      [input.title, input.athlete, id],
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `
        DELETE FROM highlight_media
        WHERE highlight_id = $1
      `,
      [id],
    );

    await insertMedia(client, id, input.media);

    await client.query("COMMIT");

    return await getHighlightById(id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const deleteHighlightById = async (id: number): Promise<Highlight | null> => {
  const existingHighlight = await getHighlightById(id);

  if (!existingHighlight) {
    return null;
  }

  const result = await pool.query(
    `
      DELETE FROM highlights
      WHERE id = $1
    `,
    [id],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return existingHighlight;
};

export {
  getAllHighlights,
  createHighlight,
  getHighlightById,
  updateHighlight,
  deleteHighlightById,
};
