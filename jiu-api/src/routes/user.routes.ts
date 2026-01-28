import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware, checkRole } from "../middlewares/auth.middleware";
import { UserRole } from "../entities/User";

const router = Router();

router.use(authMiddleware);

router.get("/me", UserController.getMe);
router.put("/me", UserController.updateMe);
router.get("/", checkRole([UserRole.ADMIN, UserRole.PROFESSOR]), UserController.list);

// Admin User Management
router.post("/", checkRole([UserRole.ADMIN]), UserController.create);
router.put("/:id", checkRole([UserRole.ADMIN]), UserController.update);
router.delete("/:id", checkRole([UserRole.ADMIN]), UserController.delete);

export default router;
