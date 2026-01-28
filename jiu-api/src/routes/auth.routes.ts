import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { rateLimit } from "express-rate-limit";

import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../schemas/auth.schema";

const router = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes).
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many login attempts, please try again after 15 minutes" }
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many accounts created from this IP, please try again after an hour" }
});

router.post("/register", registerLimiter, validate(registerSchema), AuthController.register);
router.post("/login", loginLimiter, validate(loginSchema), AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/forgot-password", validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), AuthController.resetPassword);

export default router;
