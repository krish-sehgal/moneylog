import mongoose, { model, Schema } from "mongoose";
import { TRANSACTION_ENTRIES, TransactionEntry } from "../types/index.js";

export interface ITransaction {
    userId: mongoose.Types.ObjectId;
    amount: number;
    entry: TransactionEntry;
    notes?: string;
    createdAt?: Date;
}

const transactionSchema = new Schema<ITransaction>({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    entry: {
        type: String,
        enum: TRANSACTION_ENTRIES,
        required: true
    },
    notes: {
        type: String,
        maxlength: 250,
        trim: true
    }
}, { timestamps: true });

transactionSchema.index({ userId: 1, _id: -1 })

export const TransactionModel = model<ITransaction>("Transaction", transactionSchema);
