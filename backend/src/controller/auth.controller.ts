import type { Request, Response } from "express"
import { ApiResponse } from "../lib/api.js"

export function login(req: Request, res: Response){
    try {
        res.status(200).json(new ApiResponse(200))
    } catch (error) {
        res.status(500).json({
            message: "ram ram ji"
        })
    }
}