import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import { errorHandler } from "./middleware/errorHandler.js"
import { ApiError, ApiResponse } from "./lib/api.js"
import v1Router from "./router/v1.router.js"

const app = express()

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean)

app.use(cors({
    origin(origin, callback) {
        // Same-origin, curl, and server-to-server requests have no Origin header
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
            return
        }
        callback(new ApiError(403, `Origin ${origin} is not allowed`))
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}))

app.use(cookieParser())
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
    res.status(200).json(new ApiResponse(200, "I am fine, but i think you are not"))
})

app.use('/api/v1', v1Router)

app.use((req, res) => {
    throw new ApiError(404, "Route not found")
});

app.use(errorHandler)

export default app
