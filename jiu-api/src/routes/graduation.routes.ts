import { Router } from "express";
import { GraduationController } from "../controllers/GraduationController";
import { authMiddleware, checkRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.use(checkRole(["professor", "admin"]));

router.get("/students", GraduationController.listStudents);
router.patch("/students/:id/goal", GraduationController.updateGoal);
router.post("/students/:id/promote", GraduationController.promoteStudent);
router.post("/students/:id/adjust-attendance", GraduationController.adjustAttendance);
router.patch("/students/:id/graduation-date", GraduationController.updateGraduationDate);

export default router;

