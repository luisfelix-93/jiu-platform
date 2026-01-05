import { Router } from "express";
import { DashboardController } from "../controllers/DashboardController";
import { authMiddleware, checkRole } from "../middlewares/auth.middleware";
import { UserRole } from "../entities/User";

const router = Router();

router.use(authMiddleware);

router.get("/", DashboardController.getDashboard); // Auto-detect role
router.get("/aluno", checkRole([UserRole.ALUNO, UserRole.ADMIN]), DashboardController.getStudentDashboard);
router.get("/professor", checkRole([UserRole.PROFESSOR, UserRole.ADMIN]), DashboardController.getProfessorDashboard);
router.get("/admin", checkRole([UserRole.ADMIN]), DashboardController.getAdminDashboard);

export default router;
