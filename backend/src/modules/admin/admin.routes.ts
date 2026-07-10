import { Router } from "express";
import * as adminController from "./admin.controller";
import { adminLoginSchema } from "./admin.validator";
import { loginLimiter } from "../../middlewares/rateLimiter";
import { auth } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// Public: Admin login (Strict rate limit)
router.post(
  "/login",
  loginLimiter,
  validate(adminLoginSchema),
  asyncHandler(adminController.loginAdmin)
);

// Admin: Token verification (used by frontend useAuth hook)
router.get(
  "/verify",
  auth,
  asyncHandler(adminController.verifyTokenStatus)
);

// Public: Token refresh (uses HttpOnly cookie)
router.post(
  "/refresh",
  asyncHandler(adminController.refreshAdminToken)
);

// Admin: Logout (clears HttpOnly cookie)
router.post(
  "/logout",
  auth,
  asyncHandler(adminController.logoutAdmin)
);

export default router;
