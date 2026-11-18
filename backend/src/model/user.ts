import { model, Schema } from "mongoose"

export interface User {
    phone: string
    password: string
}

const userSchema = new Schema<User>(
    {
        // Stored as a string so leading zeros and country codes survive
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        // Never returned by default, the login query opts in with select("+password")
        password: {
            type: String,
            required: true,
            select: false
        },
    },
    { timestamps: true },
)

export const UserModel = model<User>("User", userSchema)
