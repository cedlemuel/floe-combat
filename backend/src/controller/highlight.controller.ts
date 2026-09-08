import type { Request, Response } from "express";

import {
  createHighlight,
  deleteHighlightById,
  getAllHighlights,
  getHighlightById,
  updateHighlight,
} from "../service/highlight.service.js";

import {
  deleteHighlightMedia,
  deleteHighlightThumbnail,
} from "../service/cloudinary.service.js";

import { createAdminActivity } from "../service/adminActivity.service.js";

import { getHighlightVideoThumbnail } from "../utils/helper.js";

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

const isValidMediaType = (value: unknown): value is "image" | "video" => {
  return value === "image" || value === "video";
};

const isHighlightMediaPublicId = (value: string) => {
  return (
    value.startsWith("floe-combat/highlights/") &&
    !value.startsWith("floe-combat/highlights/thumbnails/")
  );
};

const isHighlightThumbnailPublicId = (value: string) => {
  return value.startsWith("floe-combat/highlights/thumbnails/");
};

const getHighlightsController = async (_req: Request, res: Response) => {
  try {
    const highlights = await getAllHighlights();

    res.status(200).json({
      success: true,
      message: "Highlights fetched successfully.",
      result: highlights,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not fetch highlights.",
    });
  }
};

const getHighlightController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({
      success: false,
      message: "Highlight ID must be a positive integer.",
    });

    return;
  }

  try {
    const highlight = await getHighlightById(id);

    if (!highlight) {
      res.status(404).json({
        success: false,
        message: "Highlight not found.",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Highlight fetched successfully.",
      result: highlight,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not fetch highlight.",
    });
  }
};

const createHighlightController = async (req: Request, res: Response) => {
  const {
    title,
    athlete,
    media_type,
    media_url,
    media_public_id,
    thumbnail_url,
    thumbnail_public_id,
  } = req.body as Record<string, unknown>;

  if (!isNonEmptyString(title) || !isNonEmptyString(athlete)) {
    res.status(400).json({
      success: false,
      message: "Title and athlete are required.",
    });

    return;
  }

  if (!isValidMediaType(media_type)) {
    res.status(400).json({
      success: false,
      message: "Invalid media type.",
    });

    return;
  }

  if (
    !isNonEmptyString(media_url) ||
    !isNonEmptyString(media_public_id) ||
    !isHighlightMediaPublicId(media_public_id)
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid highlight media.",
    });

    return;
  }

  const hasThumbnailUrl = thumbnail_url !== undefined && thumbnail_url !== null;

  const hasThumbnailPublicId =
    thumbnail_public_id !== undefined && thumbnail_public_id !== null;

  if (hasThumbnailUrl !== hasThumbnailPublicId) {
    res.status(400).json({
      success: false,
      message: "Thumbnail URL and public ID must be provided together.",
    });

    return;
  }

  let customThumbnailUrl: string | null = null;

  let customThumbnailPublicId: string | null = null;

  if (hasThumbnailUrl && hasThumbnailPublicId) {
    if (
      !isNonEmptyString(thumbnail_url) ||
      !isNonEmptyString(thumbnail_public_id) ||
      !isHighlightThumbnailPublicId(thumbnail_public_id)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid thumbnail.",
      });

      return;
    }

    customThumbnailUrl = thumbnail_url.trim();

    customThumbnailPublicId = thumbnail_public_id.trim();
  }

  if (media_type === "image" && customThumbnailPublicId) {
    res.status(400).json({
      success: false,
      message: "Image highlights cannot have a video thumbnail.",
    });

    return;
  }

  const mediaPublicId = media_public_id.trim();

  const finalThumbnailUrl =
    media_type === "video"
      ? (customThumbnailUrl ?? getHighlightVideoThumbnail(mediaPublicId))
      : null;

  const finalThumbnailPublicId =
    media_type === "video" ? customThumbnailPublicId : null;

  try {
    const highlight = await createHighlight({
      title: title.trim(),
      athlete: athlete.trim(),
      mediaType: media_type,
      mediaUrl: media_url.trim(),
      mediaPublicId,
      thumbnailUrl: finalThumbnailUrl,
      thumbnailPublicId: finalThumbnailPublicId,
    });

    try {
      await createAdminActivity(
        req.admin!.adminId,
        "CREATE_HIGHLIGHT",
        "highlight",
        highlight.id,
      );
    } catch (activityError) {
      console.error("Failed to create admin activity:", activityError);
    }

    res.status(201).json({
      success: true,
      message: "Highlight created successfully.",
      result: highlight,
    });
  } catch (error) {
    console.error(error);

    try {
      await deleteHighlightMedia(mediaPublicId, media_type);
    } catch (cleanupError) {
      console.error("Failed to cleanup new highlight media:", cleanupError);
    }

    if (customThumbnailPublicId) {
      try {
        await deleteHighlightThumbnail(customThumbnailPublicId);
      } catch (cleanupError) {
        console.error("Failed to cleanup new thumbnail:", cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Could not create highlight.",
    });
  }
};

const updateHighlightController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({
      success: false,
      message: "Highlight ID must be a positive integer.",
    });

    return;
  }

  const {
    title,
    athlete,
    media_type,
    media_url,
    media_public_id,
    thumbnail_url,
    thumbnail_public_id,
    thumbnail_removed,
  } = req.body as Record<string, unknown>;

  if (!isNonEmptyString(title) || !isNonEmptyString(athlete)) {
    res.status(400).json({
      success: false,
      message: "Title and athlete are required.",
    });

    return;
  }

  if (
    thumbnail_removed !== undefined &&
    typeof thumbnail_removed !== "boolean"
  ) {
    res.status(400).json({
      success: false,
      message: "thumbnail_removed must be a boolean.",
    });

    return;
  }

  const mediaProvided =
    media_type !== undefined ||
    media_url !== undefined ||
    media_public_id !== undefined;

  if (mediaProvided) {
    if (
      !isValidMediaType(media_type) ||
      !isNonEmptyString(media_url) ||
      !isNonEmptyString(media_public_id) ||
      !isHighlightMediaPublicId(media_public_id)
    ) {
      res.status(400).json({
        success: false,
        message: "Media type, URL, and public ID must be provided together.",
      });

      return;
    }
  }

  const thumbnailProvided =
    thumbnail_url !== undefined || thumbnail_public_id !== undefined;

  if (thumbnailProvided) {
    if (
      !isNonEmptyString(thumbnail_url) ||
      !isNonEmptyString(thumbnail_public_id) ||
      !isHighlightThumbnailPublicId(thumbnail_public_id)
    ) {
      res.status(400).json({
        success: false,
        message: "Thumbnail URL and public ID must be provided together.",
      });

      return;
    }
  }

  if (thumbnailProvided && thumbnail_removed === true) {
    res.status(400).json({
      success: false,
      message: "A thumbnail cannot be uploaded and removed at the same time.",
    });

    return;
  }

  let newMediaPublicId: string | null = null;

  let newMediaType: "image" | "video" | null = null;

  let newThumbnailPublicId: string | null = null;

  try {
    const existingHighlight = await getHighlightById(id);

    if (!existingHighlight) {
      res.status(404).json({
        success: false,
        message: "Highlight not found.",
      });

      return;
    }

    let finalMediaType = existingHighlight.media_type;

    let finalMediaUrl = existingHighlight.media_url;

    let finalMediaPublicId = existingHighlight.media_public_id;

    if (mediaProvided) {
      finalMediaType = media_type as "image" | "video";

      finalMediaUrl = (media_url as string).trim();

      finalMediaPublicId = (media_public_id as string).trim();

      newMediaType = finalMediaType;
      newMediaPublicId = finalMediaPublicId;
    }

    let finalThumbnailUrl = existingHighlight.thumbnail_url;

    let finalThumbnailPublicId = existingHighlight.thumbnail_public_id;

    if (finalMediaType === "image") {
      finalThumbnailUrl = null;
      finalThumbnailPublicId = null;
    } else if (thumbnailProvided) {
      finalThumbnailUrl = (thumbnail_url as string).trim();

      finalThumbnailPublicId = (thumbnail_public_id as string).trim();

      newThumbnailPublicId = finalThumbnailPublicId;
    } else if (thumbnail_removed === true) {
      finalThumbnailUrl = getHighlightVideoThumbnail(finalMediaPublicId);

      finalThumbnailPublicId = null;
    } else if (
      mediaProvided &&
      existingHighlight.thumbnail_public_id === null
    ) {
      finalThumbnailUrl = getHighlightVideoThumbnail(finalMediaPublicId);

      finalThumbnailPublicId = null;
    }

    const updatedHighlight = await updateHighlight(id, {
      title: title.trim(),
      athlete: athlete.trim(),
      mediaType: finalMediaType,
      mediaUrl: finalMediaUrl,
      mediaPublicId: finalMediaPublicId,
      thumbnailUrl: finalThumbnailUrl,
      thumbnailPublicId: finalThumbnailPublicId,
    });

    if (!updatedHighlight) {
      throw new Error("Highlight was not returned after update.");
    }

    if (
      mediaProvided &&
      existingHighlight.media_public_id !== finalMediaPublicId
    ) {
      try {
        await deleteHighlightMedia(
          existingHighlight.media_public_id,
          existingHighlight.media_type,
        );
      } catch (cleanupError) {
        console.error("Failed to delete old highlight media:", cleanupError);
      }
    }

    if (
      existingHighlight.thumbnail_public_id &&
      existingHighlight.thumbnail_public_id !== finalThumbnailPublicId
    ) {
      try {
        await deleteHighlightThumbnail(existingHighlight.thumbnail_public_id);
      } catch (cleanupError) {
        console.error(
          "Failed to delete old highlight thumbnail:",
          cleanupError,
        );
      }
    }

    try {
      await createAdminActivity(
        req.admin!.adminId,
        "UPDATE_HIGHLIGHT",
        "highlight",
        updatedHighlight.id,
      );
    } catch (activityError) {
      console.error("Failed to create admin activity:", activityError);
    }

    res.status(200).json({
      success: true,
      message: "Highlight updated successfully.",
      result: updatedHighlight,
    });
  } catch (error) {
    console.error(error);

    if (newMediaPublicId && newMediaType) {
      try {
        await deleteHighlightMedia(newMediaPublicId, newMediaType);
      } catch (cleanupError) {
        console.error("Failed to cleanup new highlight media:", cleanupError);
      }
    }

    if (newThumbnailPublicId) {
      try {
        await deleteHighlightThumbnail(newThumbnailPublicId);
      } catch (cleanupError) {
        console.error(
          "Failed to cleanup new highlight thumbnail:",
          cleanupError,
        );
      }
    }

    res.status(500).json({
      success: false,
      message: "Could not update highlight.",
    });
  }
};

const deleteHighlightController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({
      success: false,
      message: "Highlight ID must be a positive integer.",
    });

    return;
  }

  try {
    const deletedHighlight = await deleteHighlightById(id);

    if (!deletedHighlight) {
      res.status(404).json({
        success: false,
        message: "Highlight not found.",
      });

      return;
    }

    try {
      await deleteHighlightMedia(
        deletedHighlight.media_public_id,
        deletedHighlight.media_type,
      );
    } catch (cleanupError) {
      console.error("Failed to delete highlight media:", cleanupError);
    }

    if (deletedHighlight.thumbnail_public_id) {
      try {
        await deleteHighlightThumbnail(deletedHighlight.thumbnail_public_id);
      } catch (cleanupError) {
        console.error("Failed to delete highlight thumbnail:", cleanupError);
      }
    }

    try {
      await createAdminActivity(
        req.admin!.adminId,
        "DELETE_HIGHLIGHT",
        "highlight",
        deletedHighlight.id,
      );
    } catch (activityError) {
      console.error("Failed to create admin activity:", activityError);
    }

    res.status(200).json({
      success: true,
      message: "Highlight deleted successfully.",
      result: deletedHighlight,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not delete highlight.",
    });
  }
};

export {
  getHighlightsController,
  getHighlightController,
  createHighlightController,
  updateHighlightController,
  deleteHighlightController,
};
