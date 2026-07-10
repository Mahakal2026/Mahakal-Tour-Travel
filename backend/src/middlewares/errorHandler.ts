import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/appError";
import { logger } from "../config/logger";
import { env } from "../config/env";
import { sendError } from "../utils/apiResponse";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let code = err.code || "INTERNAL_ERROR";
  let message = err.message || "Internal Server Error";
  let details: any = err.details || undefined;

  // 1. Zod Schema Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "Validation failed";
    details = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  }
  // 2. Mongoose Validation Errors
  else if (err.name === "ValidationError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "Validation failed";
    details = Object.keys(err.errors).map((key) => ({
      field: key,
      message: err.errors[key].message,
    }));
  }
  // 3. JWT Token Errors
  else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    code = "UNAUTHORIZED";
    message = err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
  }
  // 4. Duplicate Key Error (MongoDB)
  else if (err.code === 11000) {
    statusCode = 400;
    code = "CONFLICT";
    message = "Resource already exists";
    details = err.keyValue;
  }
  // 5. Multer and Upload Errors
  else if (err.name === "MulterError" || err.code === "UPLOAD_ERROR" || err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    code = "UPLOAD_ERROR";
    message = err.message || "File upload error";
  }
  // 6. Cloud service/Upload service failure
  else if (err.code === "UPLOAD_FAILED") {
    statusCode = 500;
    code = "UPLOAD_FAILED";
    message = err.message || "Image upload service failed";
  }

  // Log error using Winston logger
  const reqInfo = `${req.method} ${req.originalUrl} [ReqID: ${req.id || 'N/A'}]`;
  if (statusCode >= 500) {
    logger.error(`🔥 500 Error on ${reqInfo}: ${err.stack || message}`);
  } else {
    logger.warn(`⚠️ ${statusCode} Error on ${reqInfo}: ${message}`);
  }

  // Include stack trace in response if in development mode
  const devStack = env.NODE_ENV === "development" ? { stack: err.stack } : {};

  sendError(res, message, code, statusCode, {
    ...(details && { details }),
    ...devStack,
  });
};

export default errorHandler;
