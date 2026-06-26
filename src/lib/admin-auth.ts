import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createHash } from 'crypto'

// Simple single-user password gate for the /admin area.
// The cookie stores a hash of the configured password (not the password
// itself), so it acts as a bearer token that can only be produced by
// someone who knows ADMIN_PASSWORD. Good enough for a personal internal tool.

export const ADMIN_COOKIE = 'cf_admin'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

/** The token we expect in the cookie, derived from ADMIN_PASSWORD. */
export function expectedToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD
  if (!pw) return null
  return createHash('sha256').update(`courtfinder::${pw}`).digest('hex')
}

export function isPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD)
}

export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD
  return Boolean(pw) && input === pw
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: COOKIE_MAX_AGE,
}

/** Read the cookie and check whether the current request is authenticated. */
export async function isAdmin(): Promise<boolean> {
  const expected = expectedToken()
  if (!expected) return false
  const store = await cookies()
  return store.get(ADMIN_COOKIE)?.value === expected
}

/** Guard for protected pages/layouts – redirects to the login page if not authed. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect('/admin/login')
}
