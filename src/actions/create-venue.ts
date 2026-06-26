'use server'

import { revalidatePath } from 'next/cache'
import type { VenueType } from '@/types/domain'

export interface CreateVenueResult {
  ok: boolean
  error?: string
  id?: string
}

const VALID_TYPES: VenueType[] = ['tennis', 'padel', 'gym']

export async function createVenue(formData: FormData): Promise<CreateVenueResult> {
  const name = String(formData.get('name') ?? '').trim()
  const type = String(formData.get('type') ?? '').trim() as VenueType
  const address = String(formData.get('address') ?? '').trim()
  const website = String(formData.get('website') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const latRaw = String(formData.get('lat') ?? '').trim()
  const lngRaw = String(formData.get('lng') ?? '').trim()

  // Validation
  if (!name) return { ok: false, error: 'Name ist ein Pflichtfeld.' }
  if (!VALID_TYPES.includes(type)) return { ok: false, error: 'Bitte eine gültige Sportart wählen.' }
  if (!address) return { ok: false, error: 'Adresse ist ein Pflichtfeld.' }

  const lat = Number(latRaw)
  const lng = Number(lngRaw)
  if (!latRaw || !lngRaw || Number.isNaN(lat) || Number.isNaN(lng)) {
    return { ok: false, error: 'Koordinaten fehlen. Nutze "Koordinaten suchen" oder trage sie manuell ein.' }
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { ok: false, error: 'Koordinaten liegen außerhalb des gültigen Bereichs.' }
  }
  if (website && !/^https?:\/\//i.test(website)) {
    return { ok: false, error: 'Website muss mit http:// oder https:// beginnen.' }
  }

  try {
    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('venues')
      .insert({
        name,
        type,
        address,
        lat,
        lng,
        website: website || null,
        phone: phone || null,
        source: 'crowdsourced',
        active: true,
      })
      .select('id')
      .single()

    if (error) return { ok: false, error: error.message }

    revalidatePath('/suche')
    revalidatePath('/admin')
    return { ok: true, id: data.id }
  } catch {
    return { ok: false, error: 'Datenbankfehler beim Anlegen der Venue.' }
  }
}
