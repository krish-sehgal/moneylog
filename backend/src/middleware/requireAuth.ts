import type { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
import { ApiError } from "../lib/api.js"
import { verifyToken } from "../lib/jwt.js"
import { UserModel } from "../model/user.js"
import type { AuthUser } from "../types/auth.js"

function getBearerToken(req: Request): string {
    const header = req.headers.authorization
    if (!header) {
        throw new ApiError(401, "Authentication required")
    }

    const [scheme, token, ...rest] = header.trim().split(/\s+/)
    if (scheme?.toLowerCase() !== "bearer" || !token || rest.length > 0) {
        throw new ApiError(401, "Authentication required")
    }

    return token
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
    const payload = verifyToken(getBearerToken(req))

    if (!mongoose.isValidObjectId(payload.sub)) {
        throw new ApiError(401, "Invalid or expired token")
    }

    // A valid signature is not enough: the account may have been deleted since
    const user = await UserModel.findById(payload.sub)
    if (!user) {
        throw new ApiError(401, "Invalid or expired token")
    }

    req.user = { id: user._id.toString(), phone: user.phone }
    next()
}

/**
 * Reads the user attached by requireAuth. Throws instead of returning undefined,
 * so route handlers behind requireAuth do not need null checks.
 */
export function getAuthUser(req: Request): AuthUser {
    if (!req.user) {
        throw new ApiError(401, "Authentication required")
    }
    return req.user
}
