import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import fs from "fs";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

const mongoUri = process.env.MONGO_URI || "";
const runningInDocker = fs.existsSync("/.dockerenv");
if (mongoUri.includes("mongodb://mongo") && !runningInDocker) {
  console.warn(
    "Si estás desarrollando localmente, cambia MONGO_URI a mongodb://localhost:27017/expense_tracker en tu archivo .env"
  );
}

app.use(express.json());
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000,http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowAllOrigins = allowedOrigins.includes("*");

app.use(
  cors({
    origin(origin, callback) {
      // Permite herramientas sin origin (curl, postman), todos los orígenes con '*',
      // o solo los orígenes configurados.
      if (!origin || allowAllOrigins || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "expense-tracker-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/budget", budgetRoutes);

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
