import { Router } from "express";
import { AcademyController } from "../controllers/AcademyController";
import { authMiddleware, checkRole } from "../middlewares/auth.middleware";
import { UserRole } from "../entities/User";

const router = Router();

router.use(authMiddleware);

// My academies (professor or student)
router.get("/me", AcademyController.getMyAcademies);

// Search/list academies (any authenticated user)
router.get("/", AcademyController.search);

// Get academy details
router.get("/:id", AcademyController.getOne);

// Create academy (professor only)
router.post("/", checkRole([UserRole.PROFESSOR, UserRole.ADMIN]), AcademyController.create);

// Update academy (professor owner — enforced in service)
router.put("/:id", checkRole([UserRole.PROFESSOR, UserRole.ADMIN]), AcademyController.update);

// Professor self-join
router.post("/:id/professors/join", checkRole([UserRole.PROFESSOR, UserRole.ADMIN]), AcademyController.join);

// Professor management (owner only)
router.post("/:id/professors", checkRole([UserRole.PROFESSOR, UserRole.ADMIN]), AcademyController.addProfessor);
router.delete("/:id/professors/:userId", checkRole([UserRole.PROFESSOR, UserRole.ADMIN]), AcademyController.removeProfessor);

// Student self-enrollment
router.post("/:id/students", checkRole([UserRole.ALUNO]), AcademyController.enrollStudent);
router.delete("/:id/students/me", checkRole([UserRole.ALUNO]), AcademyController.unenrollStudent);

export default router;
