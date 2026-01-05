import { Router } from "express";
import { AttendanceController } from "../controllers/AttendanceController";
import { authMiddleware, checkRole } from "../middlewares/auth.middleware";
import { UserRole } from "../entities/User";

const router = Router();

router.use(authMiddleware);

// These routes seems to be nested under lessons in spec but I can make them separate or mixed.
// Spec: 
// POST /api/lessons/:id/attendance
// GET /api/lessons/:id/attendance
// GET /api/attendance/stats/:userId

// I will create a router dependent on params or just independent.
// For now, I'll put specific attendance routes here, but the lesson-specific ones might be better in lesson routes?
// Actually I'll specific routes.

router.get("/stats/:userId", AttendanceController.getStats);
router.get("/me/stats", AttendanceController.getStats);

// For lesson specific, let's assume they are handled here but with query param or just define paths
// But paths like /lessons/:id/attendance conflict with existing lesson routes if I mount on /api/attendance.
// I will mount these on /api/attendance usually, but spec says /api/lessons/:id/attendance.
// So I should add them to lesson routes or create a router that handles /api/lessons/:id/attendance.

// I'll stick to typical REST: POST /api/attendance { lessonId, ... } is cleaner, but spec is spec.
// Spec: POST /api/lessons/:id/attendance/batch
// PUT /api/attendance/:id

// So I will update `lesson.routes.ts` to include attendance endpoints or import a sub-router.
// And create `attendance.routes.ts` for direct attendance manipulation if needed.
// The spec lists:
// GET    /api/lessons/:id/attendance 
// POST   /api/lessons/:id/attendance/batch
// PUT    /api/attendance/:id
// GET    /api/users/:id/attendance
// GET    /api/attendance/stats/:userId

// I'll follow the spec.
// /api/attendance routes:
router.put("/:id", checkRole([UserRole.ADMIN, UserRole.PROFESSOR]), AttendanceController.register); // Updating specific attendance?
router.get("/stats/:userId", AttendanceController.getStats);
router.post("/check-in", AttendanceController.checkIn);
router.get("/status/:lessonId", AttendanceController.checkStatus);

export default router;
