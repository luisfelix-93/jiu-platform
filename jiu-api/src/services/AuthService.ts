import { AppDataSource } from "../data-source";
import * as crypto from "crypto";
import { User, UserRole } from "../entities/User";
import { RefreshToken } from "../entities/RefreshToken";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { z } from "zod";
import { authConfig } from "../config/auth.config";
import { EmailService } from "./EmailService";

const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    role: z.nativeEnum(UserRole),
    beltColor: z.string().optional(),
    birthDate: z.string().optional().or(z.date()), // Accepts ISO string or Date object
});

export class AuthService {
    static async register(data: any) {
        const validatedData = registerSchema.parse(data);

        const existingUser = await userRepository.findOneBy({ email: validatedData.email });
        if (existingUser) {
            throw new Error("User already exists");
        }

        const passwordHash = await bcrypt.hash(validatedData.password, 12);

        const user = userRepository.create({
            email: validatedData.email,
            passwordHash,
            name: validatedData.name,
            role: validatedData.role,
            beltColor: validatedData.beltColor,
            birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : undefined,
        });

        await userRepository.save(user);

        return AuthService.generateTokens(user);
    }

    static async login(data: any) {
        const { email, password } = data;
        const user = await userRepository.findOneBy({ email });

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            throw new Error("Invalid credentials");
        }

        return AuthService.generateTokens(user);
    }

    static async refreshToken(token: string) {
        // 1. Check if token exists in DB
        const storedToken = await refreshTokenRepository.findOne({
            where: { token },
            relations: ["user"]
        });

        if (!storedToken) throw new Error("Invalid refresh token");

        // 2. Verify jwt
        try {
            jwt.verify(token, authConfig.getJwtSecret());
        } catch (err) {
            throw new Error("Invalid refresh token");
        }

        if (storedToken.expiresAt < new Date()) {
            await refreshTokenRepository.remove(storedToken);
            throw new Error("Refresh token expired");
        }

        // 3. Generate new tokens
        // Optionally revoke old one (rotation)
        await refreshTokenRepository.remove(storedToken);

        return AuthService.generateTokens(storedToken.user);
    }

    private static async generateTokens(user: User) {
        const secret = authConfig.getJwtSecret();

        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            secret,
            { expiresIn: authConfig.jwtExpiresIn as any }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            secret,
            { expiresIn: authConfig.refreshTokenExpiresIn as any }
        );

        // Save refresh token
        const tokenEntity = refreshTokenRepository.create({
            user,
            token: refreshToken,
            expiresAt: authConfig.refreshTokenExpiresDate()
        });
        await refreshTokenRepository.save(tokenEntity);

        return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, accessToken, refreshToken };
    }

    static async forgotPassword(email: string) {
        const user = await userRepository.findOneBy({ email });
        if (!user) {
            // Silently fail to prevent email enumeration
            return;
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        user.resetToken = resetToken;
        user.resetTokenExpires = resetTokenExpires;

        await userRepository.save(user);

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

        console.log(`[RESET PASSWORD] Link for ${email}: ${resetLink}`);

        await EmailService.sendMail(
            email,
            "Redefinição de Senha",
            `<p>Você solicitou uma redefinição de senha.</p>
             <p>Clique no link abaixo para redefinir sua senha:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>Este link expira em 30 minutos.</p>`
        );
    }

    static async resetPassword(token: string, password: string) {
        const user = await userRepository.findOne({ where: { resetToken: token } });

        if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
            throw new Error("Invalid or expired token");
        }

        const passwordHash = await bcrypt.hash(password, 12);

        user.passwordHash = passwordHash;
        user.resetToken = null as any;
        user.resetTokenExpires = null as any;

        await userRepository.save(user);
    }
}
