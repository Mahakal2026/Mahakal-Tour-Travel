import rateLimit from "express-rate-limit";
import { sendError } from "../utils/apiResponse";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  handler: (req, res) => {
    sendError(
      res,
      "Too many requests from this IP, please try again after 15 minutes.",
      "TOO_MANY_REQUESTS",
      429
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 15 : 100, // Max 15 per 15m in prod, 100 in dev for testing
  handler: (req, res) => {
    sendError(
      res,
      "Too many booking inquiries sent from this IP, please try again after 15 minutes.",
      "TOO_MANY_REQUESTS",
      429
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 login attempts per 15 minutes per IP
  handler: (req, res) => {
    sendError(
      res,
      "Too many login attempts from this IP, please try again after 15 minutes.",
      "TOO_MANY_REQUESTS",
      429
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});
