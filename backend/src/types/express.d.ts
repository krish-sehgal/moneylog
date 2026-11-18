import type { AuthUser } from "./auth.js"

declare global {
    namespace Express {
        interface Request {
            // Set by requireAuth; absent on public routes
            user?: AuthUser
        }
    }
}

export {}
