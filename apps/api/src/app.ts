/**
 * Express uygulama yapılandırma dosyası.
 * Tüm global middleware'ler, statik dosya servisi ve API route'ları burada tanımlanır.
 * Middleware sırası güvenlik açısından kritiktir:
 *   helmet → cors → body parsing → statik dosyalar → rate limit → route'lar → hata yakalama
 * Route'lar /api/v1/ prefix'i altında modüler olarak mount edilir.
 * Bu dosya server.ts tarafından import edilir ve listen() ile başlatılır.
 */

import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
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

// Security headers — cross-origin policy allows mobile app to fetch static images
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS — supports comma-separated origins or wildcard
app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(","),
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve product images from public/images with 7-day cache
app.use(
  "/images",
  express.static(path.join(__dirname, "../public/images"), {
    maxAge: "7d",
  })
);

// Rate limiter — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
});
app.use(limiter);

// Health check endpoint (not behind /api/v1)
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

// Mount API v1 route modules
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/restaurants", restaurantsRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/addresses", addressesRouter);

// Global error handler — must be registered last
app.use(errorMiddleware);

export default app;
