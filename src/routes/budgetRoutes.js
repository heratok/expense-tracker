import express from "express";
import { body } from "express-validator";
import { getCurrentBudget, upsertBudget } from "../controllers/budgetController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

router.get("/current", protect, getCurrentBudget);

router.post(
  "/",
  protect,
  [
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
    body("month").isInt({ min: 1, max: 12 }).withMessage("Month must be 1-12"),
    body("year").isInt({ min: 2000 }).withMessage("Year must be valid")
  ],
  validateRequest,
  upsertBudget
);

export default router;
