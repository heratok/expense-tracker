import express from "express";
import { body, param, query } from "express-validator";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense
} from "../controllers/expenseController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

router.get(
  "/",
  protect,
  [
    query("from").optional().isISO8601().withMessage("from must be a valid date"),
    query("to").optional().isISO8601().withMessage("to must be a valid date"),
    query("category").optional().trim().escape()
  ],
  validateRequest,
  getExpenses
);

router.post(
  "/",
  protect,
  [
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("description").optional().trim().escape(),
    body("date").optional().isISO8601().withMessage("Date must be valid")
  ],
  validateRequest,
  createExpense
);

router.put(
  "/:id",
  protect,
  [
    param("id").isMongoId().withMessage("Invalid expense id"),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("description").optional().trim().escape(),
    body("date").optional().isISO8601().withMessage("Date must be valid")
  ],
  validateRequest,
  updateExpense
);

router.delete(
  "/:id",
  protect,
  [param("id").isMongoId().withMessage("Invalid expense id")],
  validateRequest,
  deleteExpense
);

export default router;
