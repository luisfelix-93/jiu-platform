import { Router } from "express";
import { ErrorLogController } from "../controllers/ErrorLogController";
import { authMiddleware, checkRole } from "../middlewares/auth.middleware";
import { UserRole } from "../entities/User";

const router = Router();

// Apenas administradores autenticados podem acessar rotas sob /api/admin
router.use(authMiddleware);
router.use(checkRole([UserRole.ADMIN]));

router.get("/error-logs", ErrorLogController.list);
router.get("/error-logs/:id", ErrorLogController.getOne);
router.delete("/error-logs", ErrorLogController.clearOld);
router.post("/error-logs/sanitize", ErrorLogController.sanitize);

export default router;
