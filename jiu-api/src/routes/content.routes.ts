import { Router } from "express";
import { ContentController } from "../controllers/ContentController";
import { authMiddleware, checkRole } from "../middlewares/auth.middleware";
import { UserRole } from "../entities/User";

const router = Router();

router.use(authMiddleware);

// Route to get presigned URL for upload
router.post("/upload-url", checkRole([UserRole.ADMIN, UserRole.PROFESSOR]), ContentController.getUploadUrl);

router.get("/library", ContentController.getLibrary);

router.post("/upload/:lessonId", checkRole([UserRole.ADMIN, UserRole.PROFESSOR]), ContentController.upload);
router.get("/lesson/:lessonId", ContentController.listLessonContent);

// Placeholder removed to avoid confusion
// router.get("/:id", async (req, res) => { ... });

export default router;
