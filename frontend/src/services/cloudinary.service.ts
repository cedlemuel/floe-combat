import type {
  CleanupAsset,
  CleanupResponse,
  CloudinaryResponse,
  UploadedFile,
  UploadPurpose,
  UploadSignatureResponse,
} from "../types/types";

const API_URL = import.meta.env.VITE_API_URL;

const getUploadSignature = async (
  purpose: UploadPurpose,
): Promise<UploadSignatureResponse["result"]> => {
  const response = await fetch(`${API_URL}/uploads/signature`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      purpose,
    }),
  });

  const data = (await response.json()) as UploadSignatureResponse;

  if (!response.ok) {
    throw new Error(data.message ?? "Could not create upload signature.");
  }

  return data.result;
};

const uploadToCloudinary = async (
  file: File,
  purpose: UploadPurpose,
): Promise<UploadedFile> => {
  const {
    timestamp,
    signature,
    folder,
    resourceType,
    allowedFormats,
    cloudName,
    apiKey,
  } = await getUploadSignature(purpose);

  const formData = new FormData();

  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);
  formData.append("allowed_formats", allowedFormats.join(","));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = (await response.json()) as
    | CloudinaryResponse
    | {
        error?: {
          message?: string;
        };
      };

  if (!response.ok) {
    const errorMessage = "error" in data ? data.error?.message : undefined;

    throw new Error(errorMessage ?? "Could not upload file to Cloudinary.");
  }

  const upload = data as CloudinaryResponse;

  return {
    url: upload.secure_url,
    publicId: upload.public_id,
    resourceType: upload.resource_type,
  };
};

const cleanupCloudinaryAssets = async (
  assets: CleanupAsset[],
): Promise<void> => {
  if (assets.length === 0) return;

  const response = await fetch(`${API_URL}/uploads/cleanup`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assets,
    }),
  });

  const data = (await response.json()) as CleanupResponse;

  if (!response.ok) {
    throw new Error(data.message ?? "Could not cleanup uploaded assets.");
  }

  if (data.result.failed.length > 0) {
    console.error(
      "Some Cloudinary assets could not be cleaned up:",
      data.result.failed,
    );
  }
};

export { uploadToCloudinary, cleanupCloudinaryAssets };
