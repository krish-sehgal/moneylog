import { Router } from "express";
import { createTransaction, fetchTransactions } from "../controller/transaction.controller.js";

const transactionRouter = Router()

transactionRouter.get('/', fetchTransactions)
transactionRouter.post('/create', createTransaction)

export default transactionRouter
