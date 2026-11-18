import { z } from "zod"

export const loginSchema = z.object({
    phone: z.string().trim().regex(/^[0-9]{10,15}$/, "Phone number must be 10 to 15 digits"),
    password: z.string().min(8, "Password must be at least 8 characters").max(25, "Password must be at most 25 characters"),
})

export type LoginInput = z.infer<typeof loginSchema>
