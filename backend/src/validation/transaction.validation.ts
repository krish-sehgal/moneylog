import { z } from "zod"
import { TRANSACTION_ENTRIES } from "../types/index.js"

export const saveTransactionSchema = z.object({
    amount: z.number().positive("Amount must be greater than 0"),
    entry: z.enum(TRANSACTION_ENTRIES),
    notes: z.string().trim().max(250, "Notes must be at most 250 characters").optional(),
})

export type SaveTransactionInput = z.infer<typeof saveTransactionSchema>
