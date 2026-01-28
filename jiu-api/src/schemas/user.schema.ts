import { z } from "zod";
import { UserRole } from "../entities/User";

export const createUserSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    name: z.string().min(2, "Name must be at least 2 characters long"),
    role: z.nativeEnum(UserRole).optional(),
    beltColor: z.string().optional(),
    stripeCount: z.number().min(0).max(4).optional(),
    birthDate: z.string().or(z.date()).optional(),
});

export const updateUserSchema = z.object({
    name: z.string().min(2).optional(),
    role: z.nativeEnum(UserRole).optional(),
    beltColor: z.string().optional(),
    stripeCount: z.number().min(0).max(4).optional(),
    birthDate: z.string().or(z.date()).optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(8).optional(),
});
