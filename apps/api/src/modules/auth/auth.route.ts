import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { authenticate } from "../../middlewares/auth.middleware";
import { loginSchema, registerSchema } from "./auth.validation";
import * as authController from "./auth.controller";

const router = Router();

router.post("/register", validate({ body: registerSchema }), authController.register);
router.post("/login", validate({ body: loginSchema }), authController.login);
router.post("/refresh", authController.refreshToken);
router.get("/me", authenticate, authController.getMe);

export default router;
