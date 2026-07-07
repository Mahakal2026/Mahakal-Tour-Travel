import { Request, Response } from "express";
import AdminService from "./admin.service";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { sendSuccess, sendError } from "../../utils/apiResponse";

/**
 * Admin Login Handler
 */
export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const result = await AdminService.loginAdmin(email, password);

  // Set httpOnly cookie for refresh token
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  logger.info(`🔑 [ReqID: ${req.id}] Admin signed in: ${result.admin.email}`);

  sendSuccess(res, {
    message: "Login successful",
    token: result.accessToken,
  });
};

/**
 * Verify Admin Token Handler
 */
export const verifyTokenStatus = async (req: Request, res: Response): Promise<void> => {
  sendSuccess(res, {
    message: "Token is valid",
    admin: req.admin,
  });
};

/**
 * Refresh Access Token Handler
 */
export const refreshAdminToken = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    sendError(res, "Refresh token not found", "UNAUTHORIZED", 401);
    return;
  }

  const result = await AdminService.refreshAdminToken(refreshToken);

  sendSuccess(res, {
    token: result.accessToken,
  });
};
