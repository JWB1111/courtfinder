import type { Venue, Court, GymOffer } from '@/types/domain'
import { createServerClient } from '@/lib/supabase/server'

// All admin reads go straight to Supabase via the service-role client,
// independent of NEXT_PUBLIC_IS_MOCK – this is the tool that populates the
// real database.

export type AdminVenue = Pick<
  Venue,
  'id' | 'name' | 'type' | 'address' | 'website' | 'active'
>

export async function getAdminVenues(): Promise<AdminVenue[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('venues')
    .select('id, name, type, address, website, active')
    .order('name')
  if (error) throw new Error(`getAdminVenues: ${error.message}`)
  return (data ?? []) as AdminVenue[]
}

export async function getAdminCourts(): Promise<
  Pick<Court, 'id' | 'venue_id' | 'name' | 'indoor'>[]
> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('courts')
    .select('id, venue_id, name, indoor')
    .order('name')
  if (error) throw new Error(`getAdminCourts: ${error.message}`)
  return data ?? []
}

export async function getAdminGymOffers(): Promise<
  Pick<GymOffer, 'id' | 'venue_id' | 'type'>[]
> {
  const supabase = createServerClient()
  const { data, error } = await supabase.from('gym_offers').select('id, venue_id, type')
  if (error) throw new Error(`getAdminGymOffers: ${error.message}`)
  return data ?? []
}
