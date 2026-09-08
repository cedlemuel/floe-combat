export type CreateHighlightInput = {
  title: string;
  athlete: string;
  mediaType: "video" | "image";
  mediaUrl: string;
  mediaPublicId: string;
  thumbnailUrl: string | null;
  thumbnailPublicId: string | null;
};

export type UpdateHighlightInput = {
  title: string;
  athlete: string;
  mediaType: "video" | "image";
  mediaUrl: string;
  mediaPublicId: string;
  thumbnailUrl: string | null;
  thumbnailPublicId: string | null;
};
