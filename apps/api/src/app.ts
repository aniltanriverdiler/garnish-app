import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";

import authRouter from "./modules/auth/auth.route";
import usersRouter from "./modules/users/users.route";
import restaurantsRouter from "./modules/restaurants/restaurants.route";
import categoriesRouter from "./modules/categories/categories.route";
import productsRouter from "./modules/products/products.route";
import cartRouter from "./modules/cart/cart.route";
import ordersRouter from "./modules/orders/orders.route";
import addressesRouter from "./modules/addresses/addresses.route";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(","),
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
});
app.use(limiter);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/restaurants", restaurantsRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/addresses", addressesRouter);

app.use(errorMiddleware);

export default app;
