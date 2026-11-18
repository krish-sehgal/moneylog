import bcrypt from "bcryptjs"
import type { Request, Response } from "express"
import { ApiError, ApiResponse } from "../lib/api.js"
import { signToken } from "../lib/jwt.js"
import { UserModel } from "../model/user.js"
import { loginSchema } from "../validation/auth.validation.js"

function isDuplicateKeyError(error: unknown): boolean {
    return typeof error === "object" && error !== null && (error as { code?: unknown }).code === 11000
}

async function findOrCreateUser(phone: string, password: string) {
    const existing = await UserModel.findOne({ phone }).select("+password")

    if (existing) {
        if (!(await bcrypt.compare(password, existing.password))) {
            throw new ApiError(401, "Invalid phone number or password")
        }
        return { user: existing, isNewUser: false }
    }

    try {
        const created = await UserModel.create({
            phone,
            password: await bcrypt.hash(password, 10),
        })
        return { user: created, isNewUser: true }
    } catch (error) {
        // Two requests raced to sign up the same number: fall back to a normal login
        if (!isDuplicateKeyError(error)) {
            throw error
        }

        const raced = await UserModel.findOne({ phone }).select("+password")
        if (!raced || !(await bcrypt.compare(password, raced.password))) {
            throw new ApiError(401, "Invalid phone number or password")
        }
        return { user: raced, isNewUser: false }
    }
}

export async function login(req: Request, res: Response) {
    const result = loginSchema.safeParse(req.body)
    if (!result.success) {
        throw new ApiError(400, result.error.issues[0]?.message ?? "Invalid request body")
    }

    const { phone, password } = result.data
    const { user, isNewUser } = await findOrCreateUser(phone, password)

    const token = signToken({ sub: user._id.toString(), phone: user.phone })

    const statusCode = isNewUser ? 201 : 200

    res.status(statusCode).json(new ApiResponse(
        statusCode,
        isNewUser ? "Account created and logged in" : "Logged in",
        {
            user: { id: user._id.toString(), phone: user.phone },
            token,
        },
    ))
}
