import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { rateLimit } from "express-rate-limit";

const router = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: "Too many login attempts, please try again after 15 minutes"
});

router.post("/register", authLimiter, AuthController.register);
router.post("/login", authLimiter, AuthController.login);
router.post("/refresh", AuthController.refresh);

export default router;
