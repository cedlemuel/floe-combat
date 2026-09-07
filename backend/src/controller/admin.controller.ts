import type { Request, Response } from "express";
import { verify } from "@node-rs/argon2";
import { getAdminByEmail } from "../service/admin.service.js";
import generateToken from "../utils/jwtTokenGenerator.js";
import { getAdminActivities } from "../service/adminActivity.service.js";

const loginAdminController = async (req: Request, res: Response) => {
  const { email, password } = req.body as Record<string, unknown>;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });

    return;
  }

  try {
    const admin = await getAdminByEmail(email.trim());

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordValid = await verify(admin.password_hash, password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(admin.id, admin.email);

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not login.",
    });
  }
};

const getAdminActivitiesController = async (_req: Request, res: Response) => {
  try {
    const activities = await getAdminActivities();

    res.status(200).json({
      success: true,
      message: "Admin activities fetched successfully.",
      result: activities,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not fetch admin activities.",
    });
  }
};

const logoutAdminController = async (_req: Request, res: Response) => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful.",
  });
};

export { loginAdminController, logoutAdminController, getAdminActivitiesController };
