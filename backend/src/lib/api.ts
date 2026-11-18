/**
 * Shared API primitives: a custom error class and a custom response envelope.
 */

export class ApiError extends Error {
    readonly statusCode: number
    readonly success = false as const

    constructor(statusCode: number, message: string, options?: ErrorOptions) {
        super(message, options)
        this.name = "ApiError"
        this.statusCode = statusCode
        Error.captureStackTrace(this, ApiError)
    }
}

export class ApiResponse<T> {
    readonly success = true as const
    readonly statusCode: number
    readonly data: T | undefined
    readonly message: string

    constructor(statusCode: number, message = "Success", data?: T) {
        this.statusCode = statusCode
        this.message = message
        this.data = data
    }
}
