import { useEffect, useState } from 'react'
import { apiUrl } from '../lib/api'

export interface AuthUser {
  id: string
  phone: string
}

type AuthState =
  | { status: 'loading'; user: null; error: null }
  | { status: 'authenticated'; user: AuthUser; error: null }
  | { status: 'unauthenticated'; user: null; error: null }
  | { status: 'error'; user: null; error: Error }

/** Checks the httpOnly auth cookie against the backend. */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    user: null,
    error: null,
  })

  useEffect(() => {
    const controller = new AbortController()

    async function checkAuth() {
      try {
        const response = await fetch(apiUrl('/api/v1/auth/me'), {
          credentials: 'include',
          signal: controller.signal,
        })

        let nextState: AuthState
        if (response.status === 401) {
          nextState = { status: 'unauthenticated', user: null, error: null }
        } else if (!response.ok) {
          throw new Error(`Authentication check failed (${response.status})`)
        } else {
          const body = (await response.json()) as { data: AuthUser }
          nextState = { status: 'authenticated', user: body.data, error: null }
        }

        if (!controller.signal.aborted) setState(nextState)
      } catch (error) {
        if (!controller.signal.aborted) {
          setState({
            status: 'error',
            user: null,
            error: error instanceof Error ? error : new Error('Authentication check failed'),
          })
        }
      }
    }

    void checkAuth()
    return () => controller.abort()
  }, [])

  return { ...state, isLoggedIn: state.status === 'authenticated' }
}
