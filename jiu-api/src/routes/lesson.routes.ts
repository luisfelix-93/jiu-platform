import { Router } from "express";
import { LessonController } from "../controllers/LessonController";
import { AttendanceController } from "../controllers/AttendanceController";
import { authMiddleware, checkRole } from "../middlewares/auth.middleware";
import { UserRole } from "../entities/User";

const router = Router();

router.use(authMiddleware);

router.get("/", LessonController.list);
router.get("/upcoming", LessonController.getUpcoming);
router.get("/:id", LessonController.getOne);

// Protected routes (Professor/Admin)
router.post("/", checkRole([UserRole.ADMIN, UserRole.PROFESSOR]), LessonController.create);
router.put("/:id/status", checkRole([UserRole.ADMIN, UserRole.PROFESSOR]), LessonController.updateStatus);
router.put("/:id", checkRole([UserRole.ADMIN, UserRole.PROFESSOR]), LessonController.update);
router.delete("/:id", checkRole([UserRole.ADMIN, UserRole.PROFESSOR]), LessonController.delete);
router.get("/:lessonId/attendance", checkRole([UserRole.ADMIN, UserRole.PROFESSOR]), AttendanceController.getLessonAttendance);

export default router;
