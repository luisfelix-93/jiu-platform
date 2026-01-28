import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware, checkRole } from "../middlewares/auth.middleware";
import { UserRole } from "../entities/User";

import { validate } from "../middlewares/validate.middleware";
import { createUserSchema, updateUserSchema } from "../schemas/user.schema";

const router = Router();

router.use(authMiddleware);

router.get("/me", UserController.getMe);
router.put("/me", validate(updateUserSchema), UserController.updateMe);
router.get("/", checkRole([UserRole.ADMIN, UserRole.PROFESSOR]), UserController.list);

// Admin User Management
router.post("/", checkRole([UserRole.ADMIN]), validate(createUserSchema), UserController.create);
router.put("/:id", checkRole([UserRole.ADMIN]), validate(updateUserSchema), UserController.update);
router.delete("/:id", checkRole([UserRole.ADMIN]), UserController.delete);

export default router;
