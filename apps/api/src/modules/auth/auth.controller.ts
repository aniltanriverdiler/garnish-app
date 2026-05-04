/**
 * Auth modülü HTTP handler'ları (controller katmanı).
 * Route tanımlarından gelen request'leri karşılar, service katmanına iletir
 * ve sonucu uygun HTTP yanıtı olarak döner.
 * İş mantığı içermez — sadece HTTP → service → HTTP dönüşümü yapar.
 * Hatalar next(error) ile error middleware'e iletilir.
 */

import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";

// Handles POST /register
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
}

// Handles POST /login
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.loginUser(req.body);
    res.json({
      success: true,
      data: result,
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
}

// Handles POST /refresh
export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
      return;
    }

    const tokens = await authService.refreshUserToken(refreshToken);
    res.json({
      success: true,
      data: tokens,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    next(error);
  }
}

// Handles GET /me
export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await authService.getUserById(req.user!.id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}
