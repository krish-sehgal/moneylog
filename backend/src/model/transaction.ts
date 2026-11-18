import mongoose, { model, Schema } from "mongoose";

interface ITransaction {
    userId: mongoose.Types.ObjectId;
    amount: number;
    entry: "debit" | "credit";
    notes: string;
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
        enum: ['debit', 'credit'],
        required: true
    },
    notes: {
        type: String
    }
}, { timestamps: true });

transactionSchema.index({ userId: 1, _id: -1 })

export const TransactionModel = model<ITransaction>("Transaction", transactionSchema);