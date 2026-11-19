import type { CookieOptions } from "express"

export const AUTH_COOKIE = "moneylog_token"

const fallbackMaxAgeMs = 7 * 24 * 60 * 60 * 1000

/** Converts JWT_EXPIRES_IN values like "7d" or "12h" into milliseconds. */
function tokenMaxAgeMs(): number {
    const raw = (process.env.JWT_EXPIRES_IN ?? "7d").trim()
    const match = /^(\d+)\s*([smhd])$/.exec(raw)
    if (!match) return fallbackMaxAgeMs

    const value = Number(match[1])
    const unit = match[2]
    const unitMs = unit === "s"
        ? 1000
        : unit === "m"
            ? 60 * 1000
            : unit === "h"
                ? 60 * 60 * 1000
                : 24 * 60 * 60 * 1000

    return value * unitMs
}

function secureOption(): boolean {
    const configured = process.env.COOKIE_SECURE?.trim().toLowerCase()
    if (configured === "true") return true
    if (configured === "false") return false
    return process.env.NODE_ENV === "production"
}

function sameSiteOption(): CookieOptions["sameSite"] {
    const configured = process.env.COOKIE_SAME_SITE?.trim().toLowerCase()
    if (configured === "none" || configured === "lax" || configured === "strict") {
        return configured
    }
    // Separate frontend/backend deployments need None; local dev stays Lax.
    return process.env.NODE_ENV === "production" ? "none" : "lax"
}

function baseCookieOptions(): CookieOptions {
    const sameSite = sameSiteOption()

    return {
        httpOnly: true,
        // Browsers reject SameSite=None cookies unless they are also Secure
        secure: secureOption() || sameSite === "none",
        sameSite,
        path: "/",
    }
}

export function authCookieOptions(): CookieOptions {
    return { ...baseCookieOptions(), maxAge: tokenMaxAgeMs() }
}

export function clearAuthCookieOptions(): CookieOptions {
    return baseCookieOptions()
}
