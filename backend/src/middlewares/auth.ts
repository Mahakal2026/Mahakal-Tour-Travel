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

export const auth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Access denied. No token provided.", 401, "UNAUTHORIZED"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as IAdminPayload;
    req.admin = decoded;
    next();
  } catch (error: any) {
    next(new AppError(error.message || "Invalid or expired token.", 401, "UNAUTHORIZED"));
  }
};

export default auth;
