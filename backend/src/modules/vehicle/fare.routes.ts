import { Router } from "express";
import { calculateFare } from "./fare.controller";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// POST /api/fare/calculate - Calculate taxi price based on vehicle criteria
router.post("/calculate", asyncHandler(calculateFare));

export default router;
