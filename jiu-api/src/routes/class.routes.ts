import { Router } from "express";
import { ClassController } from "../controllers/ClassController";
import { authMiddleware, checkRole } from "../middlewares/auth.middleware";
import { UserRole } from "../entities/User";

const router = Router();

router.use(authMiddleware);

router.get("/", ClassController.list);
router.get("/:id", ClassController.getOne);

// Protected routes (Professor/Admin)
router.post("/", checkRole([UserRole.ADMIN, UserRole.PROFESSOR]), ClassController.create);
router.put("/:id", checkRole([UserRole.ADMIN, UserRole.PROFESSOR]), ClassController.update);
router.delete("/:id", checkRole([UserRole.ADMIN, UserRole.PROFESSOR]), ClassController.delete);
router.get("/:id/students", checkRole([UserRole.ADMIN, UserRole.PROFESSOR]), ClassController.getStudents);
router.post("/:id/enroll", checkRole([UserRole.ADMIN, UserRole.PROFESSOR]), ClassController.enroll);
// router.delete("/:id/enroll/:userId", checkRole([UserRole.ADMIN, UserRole.PROFESSOR]), ClassController.removeStudent); 
// Note: Spec says DELETE /api/classes/:id/enroll/:userId. Implementing as such:
router.delete("/:id/enroll/:studentId", checkRole([UserRole.ADMIN, UserRole.PROFESSOR]), ClassController.removeStudent);

export default router;
