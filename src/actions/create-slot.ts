'use server'

import { revalidatePath } from 'next/cache'
import { SlotInputSchema } from '@/types/schemas'

export interface CreateSlotResult {
  ok: boolean
  error?: string
  id?: string
}

// Always writes to Supabase via the service-role client – this is the admin
// tool used to populate real availability, regardless of NEXT_PUBLIC_IS_MOCK.
export async function createSlot(formData: FormData): Promise<CreateSlotResult> {
  const date = (formData.get('date') as string | null)?.trim()
  const startTimeRaw = (formData.get('start_time') as string | null)?.trim()
  const endTimeRaw = (formData.get('end_time') as string | null)?.trim()
  const courtId = (formData.get('court_id') as string | null)?.trim() || null
  const venueId = (formData.get('venue_id') as string | null)?.trim() || null
  const status = formData.get('status') as string
  const priceEur = formData.get('price_eur') as string | null

  if (!date || !startTimeRaw || !endTimeRaw) {
    return { ok: false, error: 'Datum, Startzeit und Endzeit sind Pflichtfelder.' }
  }

  // Build UTC ISO strings from local date + time strings
  const start_time = new Date(`${date}T${startTimeRaw}:00.000Z`).toISOString()
  const end_time = new Date(`${date}T${endTimeRaw}:00.000Z`).toISOString()

  const price_cents =
    priceEur && priceEur.trim() !== ''
      ? Math.round(parseFloat(priceEur) * 100)
      : null

  const parsed = SlotInputSchema.safeParse({
    court_id: courtId || null,
    venue_id: venueId || null,
    start_time,
    end_time,
    status,
    price_cents,
    source: 'own',
  })

  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join('; ')
    return { ok: false, error: msg }
  }

  try {
    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('slots')
      .insert({
        ...parsed.data,
        last_updated: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) return { ok: false, error: error.message }

    if (venueId) revalidatePath(`/venue/${venueId}`)
    revalidatePath('/suche')
    return { ok: true, id: data.id }
  } catch {
    return { ok: false, error: 'Datenbankfehler.' }
  }
}
