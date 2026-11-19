import { Router } from "express";
import { login, logout, me } from "../controller/auth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const authRouter  = Router()

authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.get('/me', requireAuth, me)

export default authRouter
