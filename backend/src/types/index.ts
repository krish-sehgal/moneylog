export const TRANSACTION_ENTRIES = ["debit", "credit"] as const
export type TransactionEntry = (typeof TRANSACTION_ENTRIES)[number]