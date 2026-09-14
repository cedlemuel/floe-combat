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

import type { HighlightMediaInput } from "../types/highlightInput.js";

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

type ParseMediaResult =
  | {
      success: true;
      media: HighlightMediaInput[];
    }
  | {
      success: false;
      message: string;
    };

const parseHighlightMedia = (value: unknown): ParseMediaResult => {
  if (!Array.isArray(value) || value.length === 0) {
    return {
      success: false,
      message: "At least one highlight media item is required.",
    };
  }

  const parsedMedia: HighlightMediaInput[] = [];

  const mediaPublicIds = new Set<string>();
  const thumbnailPublicIds = new Set<string>();

  for (const [index, item] of value.entries()) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return {
        success: false,
        message: `Invalid media item at position ${index + 1}.`,
      };
    }

    const {
      media_type,
      media_url,
      media_public_id,
      thumbnail_url,
      thumbnail_public_id,
      sort_order,
    } = item as Record<string, unknown>;

    if (!isValidMediaType(media_type)) {
      return {
        success: false,
        message: `Invalid media type at position ${index + 1}.`,
      };
    }

    if (
      !isNonEmptyString(media_url) ||
      !isNonEmptyString(media_public_id) ||
      !isHighlightMediaPublicId(media_public_id)
    ) {
      return {
        success: false,
        message: `Invalid highlight media at position ${index + 1}.`,
      };
    }

    const mediaPublicId = media_public_id.trim();

    if (mediaPublicIds.has(mediaPublicId)) {
      return {
        success: false,
        message: "Duplicate highlight media is not allowed.",
      };
    }

    mediaPublicIds.add(mediaPublicId);

    const hasThumbnailUrl =
      thumbnail_url !== undefined && thumbnail_url !== null;

    const hasThumbnailPublicId =
      thumbnail_public_id !== undefined && thumbnail_public_id !== null;

    if (hasThumbnailUrl !== hasThumbnailPublicId) {
      return {
        success: false,
        message: "Thumbnail URL and public ID must be provided together.",
      };
    }

    let finalThumbnailUrl: string | null = null;
    let finalThumbnailPublicId: string | null = null;

    if (media_type === "image") {
      if (hasThumbnailUrl || hasThumbnailPublicId) {
        return {
          success: false,
          message: "Image media cannot have a video thumbnail.",
        };
      }
    }

    if (media_type === "video" && hasThumbnailUrl && hasThumbnailPublicId) {
      if (
        !isNonEmptyString(thumbnail_url) ||
        !isNonEmptyString(thumbnail_public_id) ||
        !isHighlightThumbnailPublicId(thumbnail_public_id)
      ) {
        return {
          success: false,
          message: `Invalid thumbnail at position ${index + 1}.`,
        };
      }

      const thumbnailPublicId = thumbnail_public_id.trim();

      if (thumbnailPublicIds.has(thumbnailPublicId)) {
        return {
          success: false,
          message: "Duplicate highlight thumbnail is not allowed.",
        };
      }

      thumbnailPublicIds.add(thumbnailPublicId);

      finalThumbnailUrl = thumbnail_url.trim();
      finalThumbnailPublicId = thumbnailPublicId;
    } else if (media_type === "video") {
      finalThumbnailUrl = getHighlightVideoThumbnail(mediaPublicId);
    }

    const sortOrder =
      typeof sort_order === "number" &&
      Number.isSafeInteger(sort_order) &&
      sort_order >= 0
        ? sort_order
        : index;

    parsedMedia.push({
      mediaType: media_type,
      mediaUrl: media_url.trim(),
      mediaPublicId,
      thumbnailUrl: finalThumbnailUrl,
      thumbnailPublicId: finalThumbnailPublicId,
      sortOrder,
    });
  }

  return {
    success: true,
    media: parsedMedia,
  };
};

const cleanupMedia = async (media: HighlightMediaInput[]) => {
  for (const item of media) {
    try {
      await deleteHighlightMedia(item.mediaPublicId, item.mediaType);
    } catch (error) {
      console.error("Failed to cleanup highlight media:", error);
    }

    if (item.thumbnailPublicId) {
      try {
        await deleteHighlightThumbnail(item.thumbnailPublicId);
      } catch (error) {
        console.error("Failed to cleanup highlight thumbnail:", error);
      }
    }
  }
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
  const { title, athlete, media } = req.body as Record<string, unknown>;

  if (!isNonEmptyString(title) || !isNonEmptyString(athlete)) {
    res.status(400).json({
      success: false,
      message: "Title and athlete are required.",
    });

    return;
  }

  const parsedMedia = parseHighlightMedia(media);

  if (!parsedMedia.success) {
    res.status(400).json({
      success: false,
      message: parsedMedia.message,
    });

    return;
  }

  try {
    const highlight = await createHighlight({
      title: title.trim(),
      athlete: athlete.trim(),
      media: parsedMedia.media,
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

    await cleanupMedia(parsedMedia.media);

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

  const { title, athlete, media } = req.body as Record<string, unknown>;

  if (!isNonEmptyString(title) || !isNonEmptyString(athlete)) {
    res.status(400).json({
      success: false,
      message: "Title and athlete are required.",
    });

    return;
  }

  const parsedMedia = parseHighlightMedia(media);

  if (!parsedMedia.success) {
    res.status(400).json({
      success: false,
      message: parsedMedia.message,
    });

    return;
  }

  try {
    const existingHighlight = await getHighlightById(id);

    if (!existingHighlight) {
      res.status(404).json({
        success: false,
        message: "Highlight not found.",
      });

      return;
    }

    const existingMediaPublicIds = new Set(
      existingHighlight.media.map((item) => item.media_public_id),
    );

    const existingThumbnailPublicIds = new Set(
      existingHighlight.media
        .map((item) => item.thumbnail_public_id)
        .filter((id): id is string => id !== null),
    );

    const newMedia = parsedMedia.media.filter(
      (item) => !existingMediaPublicIds.has(item.mediaPublicId),
    );

    const newThumbnails = parsedMedia.media.filter(
      (item) =>
        item.thumbnailPublicId !== null &&
        !existingThumbnailPublicIds.has(item.thumbnailPublicId),
    );

    let updatedHighlight;

    try {
      updatedHighlight = await updateHighlight(id, {
        title: title.trim(),
        athlete: athlete.trim(),
        media: parsedMedia.media,
      });
    } catch (error) {
      for (const item of newMedia) {
        try {
          await deleteHighlightMedia(item.mediaPublicId, item.mediaType);
        } catch (cleanupError) {
          console.error(
            "Failed to cleanup newly uploaded highlight media:",
            cleanupError,
          );
        }
      }

      for (const item of newThumbnails) {
        if (!item.thumbnailPublicId) continue;

        try {
          await deleteHighlightThumbnail(item.thumbnailPublicId);
        } catch (cleanupError) {
          console.error(
            "Failed to cleanup newly uploaded highlight thumbnail:",
            cleanupError,
          );
        }
      }

      throw error;
    }

    if (!updatedHighlight) {
      res.status(404).json({
        success: false,
        message: "Highlight not found.",
      });

      return;
    }

    const finalMediaPublicIds = new Set(
      updatedHighlight.media.map((item) => item.media_public_id),
    );

    const finalThumbnailPublicIds = new Set(
      updatedHighlight.media
        .map((item) => item.thumbnail_public_id)
        .filter((id): id is string => id !== null),
    );

    for (const oldMedia of existingHighlight.media) {
      if (!finalMediaPublicIds.has(oldMedia.media_public_id)) {
        try {
          await deleteHighlightMedia(
            oldMedia.media_public_id,
            oldMedia.media_type,
          );
        } catch (cleanupError) {
          console.error("Failed to delete old highlight media:", cleanupError);
        }
      }

      if (
        oldMedia.thumbnail_public_id &&
        !finalThumbnailPublicIds.has(oldMedia.thumbnail_public_id)
      ) {
        try {
          await deleteHighlightThumbnail(oldMedia.thumbnail_public_id);
        } catch (cleanupError) {
          console.error(
            "Failed to delete old highlight thumbnail:",
            cleanupError,
          );
        }
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

    for (const media of deletedHighlight.media) {
      try {
        await deleteHighlightMedia(media.media_public_id, media.media_type);
      } catch (cleanupError) {
        console.error("Failed to delete highlight media:", cleanupError);
      }

      if (media.thumbnail_public_id) {
        try {
          await deleteHighlightThumbnail(media.thumbnail_public_id);
        } catch (cleanupError) {
          console.error("Failed to delete highlight thumbnail:", cleanupError);
        }
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
