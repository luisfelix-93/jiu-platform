import { z } from "zod";

export const registerAttendanceSchema = z.object({
    userId: z.string().uuid("Invalid user ID"),
    status: z.enum(["present", "absent", "late", "excused"]),
    notes: z.string().optional()
});

export const checkInSchema = z.object({
    lessonId: z.string().uuid("Invalid lesson ID")
});
