import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { rateLimit } from "express-rate-limit";

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

router.post("/register", registerLimiter, AuthController.register);
router.post("/login", loginLimiter, AuthController.login);
router.post("/refresh", AuthController.refresh);

export default router;
