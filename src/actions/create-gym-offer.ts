'use server'

import { revalidatePath } from 'next/cache'
import type { GymOfferType } from '@/types/domain'

export interface CreateGymOfferResult {
  ok: boolean
  error?: string
  id?: string
}

const VALID_TYPES: GymOfferType[] = ['tageskarte', 'probetraining']

export async function createGymOffer(formData: FormData): Promise<CreateGymOfferResult> {
  const venueId = String(formData.get('venue_id') ?? '').trim()
  const type = String(formData.get('type') ?? '').trim() as GymOfferType
  const conditions = String(formData.get('conditions') ?? '').trim()
  const priceEur = String(formData.get('price_eur') ?? '').trim()

  if (!venueId) return { ok: false, error: 'Bitte ein Gym wählen.' }
  if (!VALID_TYPES.includes(type)) return { ok: false, error: 'Bitte einen gültigen Angebotstyp wählen.' }

  let price_cents: number | null = null
  if (priceEur !== '') {
    const parsed = parseFloat(priceEur)
    if (Number.isNaN(parsed) || parsed < 0) {
      return { ok: false, error: 'Preis muss eine Zahl ≥ 0 sein (leer = kostenlos).' }
    }
    price_cents = Math.round(parsed * 100)
  }

  try {
    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('gym_offers')
      .insert({
        venue_id: venueId,
        type,
        price_cents,
        conditions: conditions || null,
        active: true,
      })
      .select('id')
      .single()

    if (error) return { ok: false, error: error.message }

    revalidatePath('/suche')
    revalidatePath(`/venue/${venueId}`)
    revalidatePath('/admin')
    return { ok: true, id: data.id }
  } catch {
    return { ok: false, error: 'Datenbankfehler beim Anlegen des Angebots.' }
  }
}
