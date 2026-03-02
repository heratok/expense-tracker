import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";

const getMonthRange = (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

const calculateBudgetSummary = async (userId, year, month, amount) => {
  const { start, end } = getMonthRange(year, month);

  const spentAgg = await Expense.aggregate([
    { $match: { user: userId, date: { $gte: start, $lte: end } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  const spent = spentAgg[0]?.total || 0;
  const remaining = Math.max(amount - spent, 0);
  const percentageUsed = amount > 0 ? Math.round((spent / amount) * 100) : 0;

  return {
    spent,
    remaining,
    percentageUsed,
    exceeded: spent > amount
  };
};

export const getCurrentBudget = async (req, res, next) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const budget = await Budget.findOne({ user: req.user.id, month, year });
    const amount = budget?.amount || 0;
    const summary = await calculateBudgetSummary(req.user.id, year, month, amount);

    return res.json({
      budget,
      ...summary
    });
  } catch (error) {
    return next(error);
  }
};

export const upsertBudget = async (req, res, next) => {
  try {
    const { amount, month, year } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id, month, year },
      { amount },
      { upsert: true, new: true, runValidators: true }
    );

    const summary = await calculateBudgetSummary(req.user.id, year, month, amount);

    return res.status(201).json({
      budget,
      ...summary
    });
  } catch (error) {
    return next(error);
  }
};
