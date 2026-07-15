import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import AdminService from "./admin.service";
import { TokenBlocklist } from "./tokenBlocklist.model";
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
    sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  logger.debug(`🔑 [ReqID: ${req.id}] Admin signed in: ${result.admin.email}`);

  // Return flat response to support legacy frontend res.data.token syntax
  res.status(200).json({
    success: true,
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

  // Return flat response to support legacy frontend res.data.token syntax
  res.status(200).json({
    success: true,
    token: result.accessToken,
  });
};

/**
 * Admin Logout Handler
 */
export const logoutAdmin = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  });

  // Extract access token from cookies or authorization header
  let token = req.cookies?.token || req.cookies?.accessToken || req.cookies?.admin_token;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (token) {
    try {
      const decoded: any = jwt.decode(token);
      if (decoded && decoded.exp) {
        const expiresAt = new Date(decoded.exp * 1000);
        if (expiresAt > new Date()) {
          await TokenBlocklist.create({ token, expiresAt });
        }
      }
    } catch (err) {
      logger.warn(`Failed to blocklist token on logout: ${err}`);
    }
  }

  logger.debug(`🔑 [ReqID: ${req.id}] Admin logged out: ${req.admin?.email}`);

  sendSuccess(res, {
    message: "Logout successful",
  });
};

