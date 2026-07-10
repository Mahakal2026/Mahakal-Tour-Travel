
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../utils/appError";

export interface IAdminPayload {
  email: string;
  role: string;
}

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
  let token = req.cookies?.token || req.cookies?.accessToken || req.cookies?.admin_token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return next(
      new AppError(
        "Access token missing",
        401,
        "UNAUTHORIZED"
      )
    );
  }

  try {
    const decoded = jwt.verify(
      token,
      env.JWT_SECRET
    ) as IAdminPayload;

    req.admin = decoded;

    next();
  } catch (error: any) {
    return next(
      new AppError(
        "Invalid or expired access token",
        401,
        "UNAUTHORIZED"
      )
    );
  }
};

export default auth;
