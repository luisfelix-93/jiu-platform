import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entities/User";
import { RefreshToken } from "../entities/RefreshToken";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { z } from "zod";

const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    role: z.nativeEnum(UserRole),
    beltColor: z.string().optional(),
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
            if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
            jwt.verify(token, process.env.JWT_SECRET);
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
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }

        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: (process.env.JWT_EXPIRES_IN || "15m") as any }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || "7d") as any }
        );

        // Save refresh token
        const tokenEntity = refreshTokenRepository.create({
            user,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
        await refreshTokenRepository.save(tokenEntity);

        return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, accessToken, refreshToken };
    }
}
