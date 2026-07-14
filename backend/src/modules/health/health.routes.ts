import { Router } from "express";
import mongoose from "mongoose";
import { sendSuccess, sendError } from "../../utils/apiResponse";

const router = Router();

router.get("/", (req, res) => {
  const readyState = mongoose.connection.readyState;
  const dbStatusMap: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  const dbStatus = dbStatusMap[readyState] || "unknown";

  if (readyState !== 1) {
    sendError(
      res,
      `Database connectivity issue: ${dbStatus}`,
      "SERVICE_UNAVAILABLE",
      503
    );
    return;
  }

  sendSuccess(res, {
    status: "OK",
    dbStatus,
    message: "Server and database are healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
