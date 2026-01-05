import { Router } from "express";
import { ContentController } from "../controllers/ContentController";
import { authMiddleware, checkRole } from "../middlewares/auth.middleware";
import { UserRole } from "../entities/User";

const router = Router();

router.use(authMiddleware);

router.get("/library", ContentController.getLibrary);

// Routes associated with lessons
// POST /api/lessons/:id/content handled here or in lesson routes?
// Spec: POST /api/lessons/:id/content
// I will add a route /lessons/:lessonId/content in this file but mapped to /api/content? No, path should match.
// I'll register this router as /api/content.
// And I'll add a route POST /api/content/lesson/:lessonId ?
// Or I can mount a router at /api which has specific paths.

// The clean way:
// /api/content
router.get("/:id", async (req, res) => { /* get specific content */ });

// For lesson integration (POST /api/lessons/:id/content), I should probably add that to lesson routes 
// OR handle it here but the URL structure /api/content/... doesn't match /api/lessons/...

// I'll add the lesson-specific routes here but assumes the router is mounted at /api OR I just follow convenience.
// Let's stick to /api/content for general content management.
// And for lesson content, maybe I should have added it to lesson routes.

// However, I can define:
// POST /upload/:lessonId
// GET /lesson/:lessonId

router.post("/upload/:lessonId", checkRole([UserRole.ADMIN, UserRole.PROFESSOR]), ContentController.upload);
router.get("/lesson/:lessonId", ContentController.listLessonContent);

export default router;
