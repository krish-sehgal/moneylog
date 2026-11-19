const rawBackendUrl = import.meta.env.VITE_BACKEND_URL?.trim() ?? ''

/** Backend origin without a trailing slash, e.g. "https://api.example.com". Empty = same origin. */
export const backendUrl = rawBackendUrl.replace(/\/+$/, '')

/** Builds an absolute backend URL when VITE_BACKEND_URL is set, otherwise a same-origin path. */
export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${backendUrl}${normalizedPath}`
}
