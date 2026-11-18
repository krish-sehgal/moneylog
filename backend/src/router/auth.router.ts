import { Router } from "express";
import { login, me } from "../controller/auth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const authRouter  = Router()

authRouter.post('/login', login)
authRouter.get('/me', requireAuth, me)

export default authRouter
