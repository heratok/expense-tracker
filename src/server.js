import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

app.use(express.json());
// Modo pruebas: permite requests desde cualquier origen.
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "expense-tracker-api" });
});

const routeMounts = [
  ["auth", authRoutes],
  ["expenses", expenseRoutes],
  ["dashboard", dashboardRoutes],
  ["budget", budgetRoutes]
];

routeMounts.forEach(([segment, router]) => {
  app.use(`/api/${segment}`, router);
  app.use(`/${segment}`, router);
});

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed", error);
    process.exit(1);
  });
