import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../utils/appError";

export interface IAdminPayload {
  email: string;
  role: string;
}

// Extend Express Request interface to store admin payload
declare global {
  namespace Express {
    interface Request {
      admin?: IAdminPayload;
    }
  }
}

export const auth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 1. Header se token lo
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  // 2. Agar header me nahi hai to cookies se lo
  const cookieToken = req.cookies?.refreshToken; // ya req.cookies?.refreshtoken

  // 3. Jo available ho use karo
  const token = bearerToken || cookieToken;

  if (!token) {
    return next(
      new AppError(
        "Access denied. No token provided.",
        401,
        "UNAUTHORIZED"
      )
    );
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as IAdminPayload;

    req.admin = decoded;

    next();
  } catch (error: any) {
    return next(
      new AppError(
        error.message || "Invalid or expired token.",
        401,
        "UNAUTHORIZED"
      )
    );
  }
};


export default auth;
