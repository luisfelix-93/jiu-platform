import * as dotenv from "dotenv";

dotenv.config();

export const authConfig = {
    getJwtSecret: (): string => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined");
        }
        return secret;
    },
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    refreshTokenExpiresDate: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
};
