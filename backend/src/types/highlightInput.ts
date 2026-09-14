export type HighlightMediaInput = {
  mediaType: "video" | "image";
  mediaUrl: string;
  mediaPublicId: string;
  thumbnailUrl: string | null;
  thumbnailPublicId: string | null;
  sortOrder: number;
};

export type CreateHighlightInput = {
  title: string;
  athlete: string;
  media: HighlightMediaInput[];
};

export type UpdateHighlightInput = {
  title: string;
  athlete: string;
  media: HighlightMediaInput[];
};