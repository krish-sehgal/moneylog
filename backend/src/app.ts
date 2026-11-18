import express from "express"
import { errorHandler } from "./middleware/errorHandler.js"
import { ApiError, ApiResponse } from "./lib/api.js"
import v1Router from "./router/v1.router.js"

const app = express()

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
