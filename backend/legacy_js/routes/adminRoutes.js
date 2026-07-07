const express = require("express");
const { z } = require("zod");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const { loginLimiter } = require("../middleware/rateLimiter");
const { adminLogin, verifyToken } = require("../controllers/adminController");

const router = express.Router();

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

// Public: Admin login (Strict rate limit)
router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  adminLogin
);

// Admin: Verify token (used by frontend to check if logged in)
router.get("/verify", auth, verifyToken);

module.exports = router;
