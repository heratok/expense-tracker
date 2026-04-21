import Expense from "../models/Expense.js";
import { encolarGasto } from "../services/awsService.js";

export const getExpenses = async (req, res, next) => {
  try {
    const { from, to, category } = req.query;
    const filters = { user: req.user.id };

    if (category) {
      filters.category = category;
    }

    if (from || to) {
      filters.date = {};
      if (from) {
        filters.date.$gte = new Date(from);
      }
      if (to) {
        filters.date.$lte = new Date(to);
      }
    }

    const expenses = await Expense.find(filters).sort({ date: -1 });
    return res.json(expenses);
  } catch (error) {
    return next(error);
  }
};

export const createExpense = async (req, res, next) => {
  try {
    const { amount, category, description, date } = req.body;

    const expense = await Expense.create({
      user: req.user.id,
      amount,
      category,
      description,
      date: date ? new Date(date) : new Date()
    });

    await encolarGasto(expense.user, expense._id, expense.amount);

    return res.status(201).json(expense);
  } catch (error) {
    return next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, category, description, date } = req.body;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { amount, category, description, date },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    return res.json(expense);
  } catch (error) {
    return next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findOneAndDelete({ _id: id, user: req.user.id });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    return res.json({ message: "Expense deleted" });
  } catch (error) {
    return next(error);
  }
};
