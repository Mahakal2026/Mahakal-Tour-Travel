import { Response } from "express";

export interface ApiResponsePayload<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Standardized success response helper
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  pagination?: ApiResponsePayload<T>["pagination"]
): Response => {
  const payload: ApiResponsePayload<T> = {
    success: true,
    data,
    ...(pagination && { pagination }),
  };
  return res.status(statusCode).json(payload);
};

/**
 * Standardized error response helper
 */
export const sendError = (
  res: Response,
  message: string,
  code: string,
  statusCode = 500,
  details?: any
): Response => {
  const payload = {
    success: false,
    message, // Top-level message for legacy clients
    error: {
      message,
      code,
      ...(details && { details }),
    },
  };
  return res.status(statusCode).json(payload);
};
