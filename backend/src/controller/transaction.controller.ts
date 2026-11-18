import type { Request, Response } from "express";
import { ApiError, ApiResponse } from "../lib/api.js";
import { TransactionModel } from "../model/transaction.js";
import { Types } from "mongoose";
import { getAuthUser } from "../middleware/requireAuth.js";

export async function fetchTransactions(req: Request, res: Response) {
    const user = getAuthUser(req)

    const transactions = await TransactionModel.find({ userId: new Types.ObjectId(user.id) })
        .sort({ _id: -1 })
        .select("amount entry notes createdAt")
        .lean()

    res.status(200).json(new ApiResponse(200, "Transaction fetched", transactions))
}