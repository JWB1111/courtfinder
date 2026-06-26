'use client'

import { useActionState } from 'react'
import { login, type LoginState } from '@/actions/admin-auth'

const initial: LoginState = {}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initial)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-ink-700">
          Passwort
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm transition-colors hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
      >
        {pending ? 'Anmelden…' : 'Anmelden'}
      </button>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}
    </form>
  )
}
