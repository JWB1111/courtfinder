import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { isAdmin } from '@/lib/admin-auth'
import { LoginForm } from '@/components/admin/LoginForm'

export const metadata: Metadata = { title: 'Admin – Anmelden' }

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect('/admin')

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">Admin-Bereich</h1>
        <p className="text-sm text-ink-500">Interner Zugang – bitte Passwort eingeben.</p>
      </div>
      <div className="mt-6 rounded-2xl border border-ink-200 bg-white p-6 shadow-sm">
        <LoginForm />
      </div>
    </main>
  )
}
