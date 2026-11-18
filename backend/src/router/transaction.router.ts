import { Router } from "express";
import { fetchTransactions } from "../controller/transaction.controller.js";

const transactionRouter = Router()

transactionRouter.get('/', fetchTransactions)

export default transactionRouter