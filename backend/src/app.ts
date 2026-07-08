import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { env } from "./config/env";
import { logger } from "./config/logger";
import { requestId } from "./middlewares/requestId";
import { errorHandler } from "./middlewares/errorHandler";

import bookingRoutes from "./modules/booking/booking.routes";
import adminRoutes from "./modules/admin/admin.routes";
import healthRoutes from "./modules/health/health.routes";

const app = express();

// Secure HTTP headers
app.use(helmet());

// gzipped response compression for performance
app.use(compression());

// Assign Request UUID tagging
app.use(requestId);

// Parse cookie headers
app.use(cookieParser());

// Restrict request body payload size to prevent payload abuse
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Prevent NoSQL query injection by stripping $ and . operators (Express 5 compatibility shim)
app.use((req, res, next) => {
  Object.defineProperty(req, "query", {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});
app.use(mongoSanitize());

// Setup CORS configuration using allowed frontend URL from environment configuration
const allowedOrigins = [env.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS policy"));
      }
    },
    credentials: true,
  })
);

// Route Morgan HTTP request logs through Winston logger
const morganStream = {
  write: (message: string) => logger.info(message.trim()),
};
app.use(morgan("combined", { stream: morganStream }));

// Mount Modular feature-based routers
app.use("/api/health", healthRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

// Catch-all 404 Route handler for unrecognized endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Cannot ${req.method} ${req.originalUrl}. Endpoint not found.`,
      code: "NOT_FOUND",
    },
  });
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;
