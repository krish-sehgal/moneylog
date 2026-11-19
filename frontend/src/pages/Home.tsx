import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiUrl } from '../lib/api'

type TransactionEntry = 'credit' | 'debit'

interface Transaction {
  _id: string
  amount: number
  entry: TransactionEntry
  notes?: string
  createdAt: string
}

const moneyFormat = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

const dateFormat = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const formatMoney = (value: number) => moneyFormat.format(value)

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateFormat.format(date)
}

function Home() {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const goToLogin = useCallback(() => {
    navigate('/login', { replace: true })
  }, [navigate])

  const loadTransactions = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const response = await fetch(apiUrl('/api/v1/transactions'), {
          method: 'GET',
          credentials: 'include',
          signal,
        })

        const body = (await response.json().catch(() => null)) as {
          message?: string
          data?: Transaction[]
        } | null

        if (response.status === 401) {
          goToLogin()
          return
        }
        if (!response.ok) {
          throw new Error(body?.message ?? 'Could not load your logs.')
        }

        setTransactions(body?.data ?? [])
        setListError(null)
      } catch (error) {
        if (signal?.aborted) return
        setListError(error instanceof Error ? error.message : 'Could not load your logs.')
      } finally {
        if (!signal?.aborted) setLoading(false)
      }
    },
    [goToLogin],
  )

  useEffect(() => {
    const controller = new AbortController()
    // State updates happen after the awaited fetch, not synchronously during the effect.
    // oxlint-disable-next-line react/set-state-in-effect
    void loadTransactions(controller.signal)
    return () => controller.abort()
  }, [loadTransactions])

  const closeDialog = useCallback(() => setDialogOpen(false), [])

  const handleSignOut = async () => {
    try {
      await fetch(apiUrl('/api/v1/auth/logout'), {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // The cookie will expire on its own if the request cannot be made.
    } finally {
      goToLogin()
    }
  }

  const total = transactions.reduce(
    (sum, transaction) =>
      transaction.entry === 'credit' ? sum + transaction.amount : sum - transaction.amount,
    0,
  )
  const totalIn = transactions.reduce(
    (sum, transaction) => (transaction.entry === 'credit' ? sum + transaction.amount : sum),
    0,
  )
  const totalOut = transactions.reduce(
    (sum, transaction) => (transaction.entry === 'debit' ? sum + transaction.amount : sum),
    0,
  )

  return (
    <div className="flex min-h-dvh flex-col bg-white text-black">
      <header className="border-b border-black/10">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4 sm:px-10">
          <Link
            to="/"
            className="text-sm font-semibold uppercase tracking-[0.3em] text-black"
          >
            MoneyLog
          </Link>
          <div className="flex items-center gap-5">
            <span className="hidden text-[11px] uppercase tracking-[0.18em] text-black/40 sm:inline">
              Personal ledger
            </span>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/50 transition-colors hover:text-black focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-6 sm:px-10 lg:py-8">
        <section
          aria-labelledby="balance-heading"
          className="border border-black/10 bg-white p-4 text-black sm:p-5"
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2
                id="balance-heading"
                className="text-[11px] uppercase tracking-[0.2em] text-black/40"
              >
                Total balance
              </h2>
              <p className="mt-1 text-4xl font-medium tracking-tight tabular-nums sm:mt-2 sm:text-5xl">
                {formatMoney(total)}
              </p>
            </div>
            <span className="border border-black/15 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-black/40">
              INR
            </span>
          </div>

          <dl className="mt-4 grid max-w-md grid-cols-2 gap-5 border-t border-black/10 pt-4 sm:mt-5">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.18em] text-black/40">
                In
              </dt>
              <dd className="mt-1 text-sm tabular-nums sm:text-base">
                +{formatMoney(totalIn)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.18em] text-black/40">
                Out
              </dt>
              <dd className="mt-1 text-sm tabular-nums sm:text-base">
                −{formatMoney(totalOut)}
              </dd>
            </div>
          </dl>
        </section>

        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="mt-4 w-full rounded-none bg-black px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Add log
        </button>

        <section aria-labelledby="activity-heading" className="mt-6 sm:mt-8">
          <div className="flex items-baseline justify-between gap-6 border-b border-black pb-2.5">
            <h2
              id="activity-heading"
              className="text-[11px] font-semibold uppercase tracking-[0.2em]"
            >
              Activity
            </h2>
            <span className="text-[11px] uppercase tracking-[0.16em] text-black/40">
              {transactions.length} {transactions.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {loading ? (
            <p className="border-b border-black/10 py-4 text-sm text-black/40">
              Loading entries…
            </p>
          ) : listError ? (
            <div className="flex flex-col items-start gap-3 border-b border-black/10 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p role="alert" className="text-sm text-black">
                {listError}
              </p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true)
                  void loadTransactions()
                }}
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black underline-offset-4 hover:underline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black"
              >
                Retry
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-start gap-3 border-b border-black/10 py-6">
              <p className="max-w-sm text-sm leading-6 text-black/50">
                No logs yet. Add your first entry to start tracking what comes in and
                what goes out.
              </p>
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="rounded-none bg-black px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                Add your first log
              </button>
            </div>
          ) : (
            <ul>
              {transactions.map((transaction) => (
                <li
                  key={transaction._id}
                  className="flex items-center justify-between gap-4 border-b border-black/10 py-3 sm:gap-8"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 shrink-0 ${
                        transaction.entry === 'credit'
                          ? 'bg-black'
                          : 'border border-black/40'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {transaction.notes?.trim() ||
                          (transaction.entry === 'credit' ? 'Money in' : 'Money out')}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-black/40">
                        {formatDate(transaction.createdAt)} · {transaction.entry}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-medium tabular-nums sm:text-base">
                    {transaction.entry === 'credit' ? '+' : '−'}
                    {formatMoney(transaction.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="border-t border-black/10">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4 text-[11px] uppercase tracking-[0.16em] text-black/40 sm:px-10">
          <span>MoneyLog</span>
          <span>Private by default</span>
        </div>
      </footer>

      {dialogOpen ? (
        <AddLogDialog onClose={closeDialog} onCreated={() => loadTransactions()} onUnauthorized={goToLogin} />
      ) : null}
    </div>
  )
}

interface AddLogDialogProps {
  onClose: () => void
  onCreated: () => void | Promise<void>
  onUnauthorized: () => void
}

function AddLogDialog({ onClose, onCreated, onUnauthorized }: AddLogDialogProps) {
  const [entry, setEntry] = useState<TransactionEntry>('credit')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const parsedAmount = Number(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Enter an amount greater than 0.')
      return
    }
    const trimmedNotes = notes.trim()
    if (trimmedNotes.length > 250) {
      setError('Notes must be at most 250 characters.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(apiUrl('/api/v1/transactions/create'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parsedAmount,
          entry,
          ...(trimmedNotes ? { notes: trimmedNotes } : {}),
        }),
      })

      const body = (await response.json().catch(() => null)) as {
        message?: string
      } | null

      if (response.status === 401) {
        onUnauthorized()
        return
      }
      if (!response.ok) {
        throw new Error(body?.message ?? 'Could not save this log.')
      }

      await onCreated()
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save this log.')
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass =
    'w-full rounded-none border-0 border-b border-black/25 bg-transparent px-0 py-3 text-base text-black outline-none transition-colors placeholder:text-black/30 hover:border-black/50 focus:border-black'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-log-title"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close dialog"
        tabIndex={-1}
        className="absolute inset-0 cursor-default bg-black/50"
      />

      <div className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto bg-white p-5 sm:max-h-[85dvh] sm:p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-black/40">
              New entry
            </p>
            <h2
              id="add-log-title"
              className="mt-1 text-2xl font-medium tracking-tight"
            >
              Add a log
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-1 -mt-1 p-1 text-xl leading-none text-black/40 transition-colors hover:text-black focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            ×
          </button>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit} noValidate>
          <fieldset>
            <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/60">
              Type
            </legend>
            <div className="mt-2 grid grid-cols-2 border border-black">
              {(['credit', 'debit'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setEntry(option)}
                  aria-pressed={entry === option}
                  className={`rounded-none px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                    entry === option
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-black/5'
                  } ${option === 'debit' ? 'border-l border-black' : ''}`}
                >
                  {option === 'credit' ? 'Money in' : 'Money out'}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-black/60"
              htmlFor="amount"
            >
              Amount
            </label>
            <div className="relative mt-2 border-b border-black/25 transition-colors focus-within:border-black hover:border-black/50">
              <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 text-base text-black/40">
                ₹
              </span>
              <input
                autoFocus
                className="w-full rounded-none border-0 bg-transparent py-3 pr-0 pl-6 text-base text-black outline-none placeholder:text-black/30"
                id="amount"
                name="amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-black/60"
              htmlFor="notes"
            >
              Notes <span className="font-normal text-black/30">(optional)</span>
            </label>
            <textarea
              className={`${fieldClass} resize-none`}
              id="notes"
              name="notes"
              rows={3}
              maxLength={250}
              placeholder="What was this for?"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
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
            {submitting ? 'Saving…' : 'Save log'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Home
