import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Middleware that assigns a unique request ID to each incoming request.
 */
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const reqId = (req.header("X-Request-Id") || crypto.randomUUID()) as string;
  req.id = reqId;
  res.setHeader("X-Request-Id", reqId);
  next();
};

export default requestId;
