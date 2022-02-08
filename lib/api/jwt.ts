// Import Dependencies
import { JwtPayload, sign, verify as jwtVerify } from "jsonwebtoken";
import { PrivateUser, PublicUser } from "../interfaces/User";
import { env } from "process";
// Export Helpers
export const createToken = (user: PublicUser) => {
    // Import Env Data
    const { JWT_SECRET: secret } = env;
    // Define Payload
    const payload: PublicUser<true> = {
        ...user,
        meta: {
            createdAt: user.meta.createdAt.toISOString(),
            updatedAt: user.meta.updatedAt.toISOString(),
        },
    };
    // Create JWT
    const jwt = sign(payload, secret, { expiresIn: "1d" });
    // Return Token
    return jwt;
};

export const parseToken = (jwt?: string): PublicUser | null => {
    try {
        // Check Exists JWT
        if (!jwt) return null;
        // Import Env Data
        const { JWT_SECRET: secret } = env;
        // Verify JWT
        const verifiedJWT = jwtVerify(jwt, secret) as JwtPayload &
            PublicUser<true>;
        // Get User from JWT
        const user: PrivateUser = {
            id: verifiedJWT.id,
            username: verifiedJWT.username,
            password: verifiedJWT.password,
            meta: {
                createdAt: new Date(verifiedJWT.meta.createdAt),
                updatedAt: new Date(verifiedJWT.meta.updatedAt),
                deletedAt: null,
            },
        };
        // Return Token
        return user;
    } catch {
        return null;
    }
};
