export type UploadPurpose =
  | "product-image"
  | "highlight-image"
  | "highlight-video"
  | "highlight-thumbnail";

export type CleanupAsset = {
  publicId: string;
  resourceType: "image" | "video";
};
