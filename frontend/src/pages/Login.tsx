import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiUrl } from '../lib/api'

const phonePattern = /^[0-9]{10,15}$/

function Login() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const trimmedPhone = phone.trim()
    if (!phonePattern.test(trimmedPhone)) {
      setError('Enter a phone number with 10 to 15 digits.')
      return
    }
    if (password.length < 8 || password.length > 25) {
      setError('Password must be between 8 and 25 characters.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(apiUrl('/api/v1/auth/login'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: trimmedPhone, password }),
      })
      const body = (await response.json().catch(() => null)) as {
        message?: string
      } | null

      if (!response.ok) {
        throw new Error(body?.message ?? 'Unable to sign in. Please try again.')
      }

      navigate('/')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'mt-2 w-full rounded-none border-0 border-b border-black/25 bg-transparent px-0 py-3 text-base text-black outline-none transition-colors placeholder:text-black/30 hover:border-black/50 focus:border-black'

  return (
    <div className="flex min-h-dvh flex-col bg-white text-black">
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-5 sm:px-10">
        <Link
          to="/"
          className="text-sm font-semibold uppercase tracking-[0.3em] text-black"
        >
          MoneyLog
        </Link>
        <span className="text-[11px] uppercase tracking-[0.18em] text-black/40">
          Personal ledger
        </span>
      </header>

      <main className="grid flex-1 lg:grid-cols-2">
        <section className="hidden flex-col justify-between border-r border-black/10 px-10 py-16 lg:flex lg:px-14 xl:px-20">
          <p className="text-[11px] uppercase tracking-[0.2em] text-black/40">
            Ledger / 2026
          </p>

          <div>
            <h1 className="max-w-md text-5xl leading-[1.05] font-medium tracking-tight xl:text-6xl">
              Every rupee,
              <br />
              accounted for.
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-6 text-black/50">
              A quiet place to track what comes in and what goes out. No clutter,
              no noise.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-black/40">
            <span className="h-px w-8 bg-black/25" />
            Private by default
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:py-16">
          <div className="w-full max-w-sm">
            <p className="text-[11px] uppercase tracking-[0.2em] text-black/40">
              Sign in
            </p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight">
              Welcome back.
            </h2>
            <p className="mt-2 text-sm leading-6 text-black/50">
              Enter your phone number and password to continue.
            </p>

            <form
              className="mt-10 space-y-7"
              onSubmit={handleSubmit}
              noValidate
            >
              <div>
                <label
                  className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-black/60"
                  htmlFor="phone"
                >
                  Phone number
                </label>
                <input
                  className={inputClass}
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="10 to 15 digits"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-black/60"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    className={`${inputClass} pr-16`}
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="8 to 25 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-0 bottom-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/50 transition-colors hover:text-black focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {error ? (
                <p
                  role="alert"
                  className="border-l-2 border-black pl-3 text-sm leading-6 text-black"
                >
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-none bg-black px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:bg-black/40"
              >
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-8 text-xs leading-5 text-black/40">
              New numbers are registered automatically on first sign in.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Login
