import jwt, { type SignOptions } from "jsonwebtoken"
import { ApiError } from "./api.js"

export interface TokenPayload {
    sub: string
    phone: string
}

const jwtSecret = process.env.JWT_SECRET!
const JwtExpiresIn = process.env.JWT_EXPIRES_IN!

export function signToken(payload: TokenPayload): string {
    return jwt.sign(payload, jwtSecret, {
        expiresIn: JwtExpiresIn as NonNullable<SignOptions["expiresIn"]>,
    })
}

export function verifyToken(token: string): TokenPayload {
    let decoded: string | jwt.JwtPayload

    try {
        decoded = jwt.verify(token, jwtSecret)
    } catch {
        throw new ApiError(401, "Invalid or expired token")
    }

    if (
        typeof decoded === "string" ||
        typeof decoded.sub !== "string" ||
        typeof decoded.phone !== "string"
    ) {
        throw new ApiError(401, "Invalid or expired token")
    }

    return { sub: decoded.sub, phone: decoded.phone }
}
