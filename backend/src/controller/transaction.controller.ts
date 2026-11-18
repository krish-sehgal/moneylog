import type { Request, Response } from "express";
import { ApiError, ApiResponse } from "../lib/api.js";
import { TransactionModel } from "../model/transaction.js";
import { Types } from "mongoose";
import { getAuthUser } from "../middleware/requireAuth.js";
import { saveTransactionSchema } from "../validation/transaction.validation.js";

export async function fetchTransactions(req: Request, res: Response) {
    const user = getAuthUser(req)

    const transactions = await TransactionModel.find({ userId: new Types.ObjectId(user.id) })
        .sort({ _id: -1 })
        .select("amount entry notes createdAt")
        .lean()

    res.status(200).json(new ApiResponse(200, "Transaction fetched", transactions))
}

export async function createTransaction(req: Request, res: Response) {
    const user = getAuthUser(req)

    const result = saveTransactionSchema.safeParse(req.body)
    if (!result.success) {
        throw new ApiError(400, result.error.issues[0]?.message ?? "Invalid request body")
    }

    const { amount, entry, notes } = result.data

    const payload: {
        userId: Types.ObjectId
        amount: number
        entry: typeof entry
        notes?: string
    } = {
        userId: new Types.ObjectId(user.id),
        amount,
        entry,
    }
    if (notes !== undefined) {
        payload.notes = notes
    }

    const transaction = await TransactionModel.create(payload)

    res.status(201).json(new ApiResponse(201, "Transaction saved", {
        id: transaction._id.toString(),
        amount: transaction.amount,
        entry: transaction.entry,
        notes: transaction.notes,
        createdAt: transaction.createdAt,
    }))
}
