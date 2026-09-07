import type { CloudinaryUploadResult, UploadPurpose } from "../types/types";

const API_URL = import.meta.env.VITE_API_URL;

export const uploadToCloudinary = async (
  file: File,
  purpose: UploadPurpose,
): Promise<CloudinaryUploadResult> => {
  const signatureResponse = await fetch(`${API_URL}/uploads/signature`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ purpose }),
  });

  const signatureData = await signatureResponse.json();

  if (!signatureResponse.ok) {
    throw new Error(signatureData.message ?? "Could not prepare upload.");
  }

  const { timestamp, signature, folder, cloudName, apiKey } =
    signatureData.result;

  const resourceType = file.type.startsWith("video/") ? "video" : "image";

  const formData = new FormData();

  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const uploadData = await uploadResponse.json();

  if (!uploadResponse.ok) {
    throw new Error(uploadData.error?.message ?? "Cloudinary upload failed.");
  }

  return {
    secure_url: uploadData.secure_url,
    public_id: uploadData.public_id,
    resource_type: uploadData.resource_type,
  };
};
