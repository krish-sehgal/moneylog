import { Router } from "express";
import authRouter from "./auth.router.js";
import transactionRouter from "./transaction.router.js";
import { requireAuth } from "../middleware/requireAuth.js";

const v1Router = Router()

v1Router.use('/auth', authRouter)
v1Router.use('/transactions', requireAuth, transactionRouter)

export default v1Router