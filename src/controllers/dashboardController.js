import Expense from "../models/Expense.js";

const getMonthRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

export const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const { start, end } = getMonthRange(now);

    const monthlyTotalAgg = await Expense.aggregate([
      { $match: { user: req.user.id, date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const byCategory = await Expense.aggregate([
      { $match: { user: req.user.id, date: { $gte: start, $lte: end } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } }
    ]);

    const startWindow = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyComparison = await Expense.aggregate([
      { $match: { user: req.user.id, date: { $gte: startWindow, $lte: end } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthlyTotal = monthlyTotalAgg[0]?.total || 0;

    return res.json({
      monthlyTotal,
      byCategory: byCategory.map((item) => ({
        category: item._id,
        total: item.total
      })),
      monthlyComparison: monthlyComparison.map((item) => ({
        year: item._id.year,
        month: item._id.month,
        total: item.total
      }))
    });
  } catch (error) {
    return next(error);
  }
};
