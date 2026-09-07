import type { AdminLoginInput, AdminLoginResponse } from "../types/admintypes";

const API_URL = import.meta.env.VITE_API_URL;

const loginAdmin = async ({
  email,
  password,
}: AdminLoginInput): Promise<AdminLoginResponse> => {
  const response = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed.");
  }

  return data;
};

const logoutAdmin = async (): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/logout`, {
    method: "POST",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Logout failed.");
  }
};

export { loginAdmin, logoutAdmin };
