import cors from "cors";
import express from "express";
import productRoutes from "./routes/product.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import pool from "./db/pool.js";
import highlightRoutes from "./routes/highlight.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";

const app = express();
app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/api/health/database", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS database_time");

    res.status(200).json({
      status: "ok",
      databaseTime: result.rows[0].database_time,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message: "Could not connect to PostgreSQL.",
    });
  }
});

app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/products", productRoutes);
app.use("/api/highlights", highlightRoutes);
app.use("/api/reviews", reviewRoutes);

export default app;
