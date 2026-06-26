// Core domain types – mirrors the Supabase schema exactly

export type VenueType = 'tennis' | 'padel' | 'gym'
export type VenueSource = 'partner' | 'integration' | 'crowdsourced' | 'club_website'
export type CourtSurface = 'sand' | 'hartplatz' | 'kunstrasen' | 'teppich' | 'beton'
export type SlotStatus = 'frei' | 'belegt' | 'unbekannt'
export type SlotSource = 'own' | 'integration' | 'scraper' | 'crowdsourced'
export type GymOfferType = 'tageskarte' | 'probetraining'
export type ReportedStatus = 'frei' | 'belegt'

export interface Venue {
  id: string
  name: string
  type: VenueType
  address: string
  lat: number
  lng: number
  operator: string | null
  website: string | null
  phone: string | null
  photo_url: string | null
  source: VenueSource
  active: boolean
  created_at: string
  updated_at: string
}

export interface Court {
  id: string
  venue_id: string
  name: string
  surface: CourtSurface | null
  indoor: boolean
  created_at: string
}

export interface Slot {
  id: string
  court_id: string | null
  venue_id: string | null
  start_time: string // ISO 8601
  end_time: string
  status: SlotStatus
  price_cents: number | null
  source: SlotSource
  last_updated: string
  created_at: string
}

export interface GymOffer {
  id: string
  venue_id: string
  type: GymOfferType
  price_cents: number | null
  conditions: string | null
  valid_from: string | null // ISO date
  valid_until: string | null
  active: boolean
  created_at: string
}

export interface CrowdReport {
  id: string
  venue_id: string | null
  court_id: string | null
  reported_status: ReportedStatus
  reported_at: string
  reporter_token: string | null
  trust_score: number
}

// Joined / enriched types used in the UI
export interface VenueWithCourts extends Venue {
  courts: Court[]
}

export interface VenueWithOffers extends Venue {
  gym_offers: GymOffer[]
}

export interface SlotWithCourt extends Slot {
  court: Court | null
}
