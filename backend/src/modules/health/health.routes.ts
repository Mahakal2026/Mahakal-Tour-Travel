import { Router } from "express";
import { sendSuccess } from "../../utils/apiResponse";

const router = Router();

router.get("/", (req, res) => {
  sendSuccess(res, {
    status: "OK",
    message: "Server is healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
