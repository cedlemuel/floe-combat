export type ResourceType = "image" | "video";

export type CloudinaryError = {
  error?: {
    message?: string;
    http_code?: number;
    name?: string;
  };
  message?: string;
  http_code?: number;
  name?: string;
};
