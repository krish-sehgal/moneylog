import type { ErrorRequestHandler } from "express"
import { ApiError } from "../lib/api.js"

/**
 * Normalises anything thrown in a route into an ApiError, so the handler only
 * ever deals with one error type.
 */
function toApiError(err: unknown): ApiError {
    if (err instanceof ApiError) {
        return err
    }

    const status = typeof err === "object" && err !== null
        ? (err as { status?: unknown; statusCode?: unknown }).status ??
          (err as { statusCode?: unknown }).statusCode
        : undefined

    const statusCode = typeof status === "number" && status >= 400 && status <= 599
        ? status
        : 500

    const message = err instanceof Error && err.message
        ? err.message
        : "Something went wrong"

    return new ApiError(statusCode, message, { cause: err })
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    // The response is already being streamed, so let Express close the connection
    if (res.headersSent) {
        next(err)
        return
    }

    const error = toApiError(err)
    const isServerError = error.statusCode >= 500

    res.status(error.statusCode).json({
        success: false,
        message: isServerError && process.env.NODE_ENV === "production"
            ? "Internal server error"
            : error.message,
    })
}
