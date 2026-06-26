'use server'

import { revalidatePath } from 'next/cache'
import type { CourtSurface } from '@/types/domain'

export interface CreateCourtResult {
  ok: boolean
  error?: string
  id?: string
}

const VALID_SURFACES: CourtSurface[] = ['sand', 'hartplatz', 'kunstrasen', 'teppich', 'beton']

export async function createCourt(formData: FormData): Promise<CreateCourtResult> {
  const venueId = String(formData.get('venue_id') ?? '').trim()
  const name = String(formData.get('name') ?? '').trim()
  const surfaceRaw = String(formData.get('surface') ?? '').trim()
  const indoor = formData.get('indoor') === 'on' || formData.get('indoor') === 'true'

  if (!venueId) return { ok: false, error: 'Bitte eine Venue wählen.' }
  if (!name) return { ok: false, error: 'Platzname ist ein Pflichtfeld.' }

  const surface = surfaceRaw && VALID_SURFACES.includes(surfaceRaw as CourtSurface) ? surfaceRaw : null

  try {
    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('courts')
      .insert({ venue_id: venueId, name, surface, indoor })
      .select('id')
      .single()

    if (error) return { ok: false, error: error.message }

    revalidatePath('/suche')
    revalidatePath(`/venue/${venueId}`)
    revalidatePath('/admin')
    return { ok: true, id: data.id }
  } catch {
    return { ok: false, error: 'Datenbankfehler beim Anlegen des Platzes.' }
  }
}
