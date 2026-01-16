import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
    SMTP_PORT: z.coerce.number().int().positive(),
    SMTP_USER: z.string().optional(), // authentication might be optional depending on relay
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().email("SMTP_FROM must be a valid email"),
    SMTP_SECURE: z.coerce.boolean().optional().default(false),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error("❌ Invalid Email Configuration:", result.error.format());
    process.exit(1); // Fail fast
}

const env = result.data;

export const emailConfig = {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
        user: env.SMTP_USER || "",
        pass: env.SMTP_PASS || "",
    },
    from: env.SMTP_FROM,
};
