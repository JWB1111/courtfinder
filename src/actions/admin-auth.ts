'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  ADMIN_COOKIE,
  checkPassword,
  cookieOptions,
  expectedToken,
  isPasswordConfigured,
} from '@/lib/admin-auth'

export interface LoginState {
  error?: string
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get('password') ?? '')

  if (!isPasswordConfigured()) {
    return { error: 'ADMIN_PASSWORD ist nicht gesetzt (.env.local bzw. Vercel-Einstellungen).' }
  }
  if (!checkPassword(password)) {
    return { error: 'Falsches Passwort.' }
  }

  const token = expectedToken()
  if (!token) return { error: 'Konfigurationsfehler.' }

  const store = await cookies()
  store.set(ADMIN_COOKIE, token, cookieOptions)

  redirect('/admin')
}

export async function logout(): Promise<void> {
  const store = await cookies()
  store.delete(ADMIN_COOKIE)
  redirect('/admin/login')
}
