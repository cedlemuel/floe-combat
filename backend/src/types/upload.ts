export type UploadPurpose =
  | "product-image"
  | "highlight-image"
  | "highlight-video"
  | "highlight-thumbnail"
  | "promo-image";

export type CleanupAsset = {
  publicId: string;
  resourceType: "image" | "video";
};
