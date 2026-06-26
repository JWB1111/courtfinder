import { z } from 'zod'

// ── Enums ──────────────────────────────────────────────────────────────────

export const VenueTypeSchema = z.enum(['tennis', 'padel', 'gym'])
export const VenueSourceSchema = z.enum(['partner', 'integration', 'crowdsourced', 'club_website'])
export const CourtSurfaceSchema = z.enum(['sand', 'hartplatz', 'kunstrasen', 'teppich', 'beton'])
export const SlotStatusSchema = z.enum(['frei', 'belegt', 'unbekannt'])
export const SlotSourceSchema = z.enum(['own', 'integration', 'scraper', 'crowdsourced'])
export const GymOfferTypeSchema = z.enum(['tageskarte', 'probetraining'])
export const ReportedStatusSchema = z.enum(['frei', 'belegt'])

// ── DB row schemas (match Supabase columns 1:1) ────────────────────────────

export const VenueSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: VenueTypeSchema,
  address: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  operator: z.string().nullable(),
  website: z.string().url().nullable(),
  phone: z.string().nullable(),
  photo_url: z.string().url().nullable(),
  source: VenueSourceSchema,
  active: z.boolean(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
})

export const CourtSchema = z.object({
  id: z.string().uuid(),
  venue_id: z.string().uuid(),
  name: z.string().min(1),
  surface: CourtSurfaceSchema.nullable(),
  indoor: z.boolean(),
  created_at: z.string().datetime({ offset: true }),
})

export const SlotSchema = z.object({
  id: z.string().uuid(),
  court_id: z.string().uuid().nullable(),
  venue_id: z.string().uuid().nullable(),
  start_time: z.string().datetime({ offset: true }),
  end_time: z.string().datetime({ offset: true }),
  status: SlotStatusSchema,
  price_cents: z.number().int().nonnegative().nullable(),
  source: SlotSourceSchema,
  last_updated: z.string().datetime({ offset: true }),
  created_at: z.string().datetime({ offset: true }),
})

export const GymOfferSchema = z.object({
  id: z.string().uuid(),
  venue_id: z.string().uuid(),
  type: GymOfferTypeSchema,
  price_cents: z.number().int().nonnegative().nullable(),
  conditions: z.string().nullable(),
  valid_from: z.string().date().nullable(),
  valid_until: z.string().date().nullable(),
  active: z.boolean(),
  created_at: z.string().datetime({ offset: true }),
})

export const CrowdReportSchema = z.object({
  id: z.string().uuid(),
  venue_id: z.string().uuid().nullable(),
  court_id: z.string().uuid().nullable(),
  reported_status: ReportedStatusSchema,
  reported_at: z.string().datetime({ offset: true }),
  reporter_token: z.string().nullable(),
  trust_score: z.number().min(0).max(1),
})

// ── Input schemas (for forms / API calls) ────────────────────────────────

export const CrowdReportInputSchema = z
  .object({
    venue_id: z.string().uuid().nullable().default(null),
    court_id: z.string().uuid().nullable().default(null),
    reported_status: ReportedStatusSchema,
    reporter_token: z.string().max(64).nullable().default(null),
  })
  .refine((d) => d.venue_id !== null || d.court_id !== null, {
    message: 'Entweder venue_id oder court_id muss gesetzt sein',
  })

export const SlotInputSchema = z
  .object({
    court_id: z.string().uuid().nullable().default(null),
    venue_id: z.string().uuid().nullable().default(null),
    start_time: z.string().datetime({ offset: true }),
    end_time: z.string().datetime({ offset: true }),
    status: SlotStatusSchema,
    price_cents: z.number().int().nonnegative().nullable().default(null),
    source: SlotSourceSchema,
  })
  .refine((d) => d.court_id !== null || d.venue_id !== null, {
    message: 'Entweder court_id oder venue_id muss gesetzt sein',
  })
  .refine((d) => new Date(d.end_time) > new Date(d.start_time), {
    message: 'end_time muss nach start_time liegen',
  })

// ── Filter schema (für die Listenansicht – Phase 3) ───────────────────────

export const VenueFilterSchema = z.object({
  types: z.array(VenueTypeSchema).default([]),
  onlyFree: z.boolean().default(false),
  indoorOnly: z.boolean().default(false),
  hasTageskarte: z.boolean().default(false),
  hasProbetraining: z.boolean().default(false),
  radiusKm: z.number().positive().default(10),
  userLat: z.number().optional(),
  userLng: z.number().optional(),
  dateFrom: z.string().datetime({ offset: true }).optional(),
  dateTo: z.string().datetime({ offset: true }).optional(),
})

// ── Inferred TS types ─────────────────────────────────────────────────────

export type VenueInput = z.infer<typeof VenueSchema>
export type CourtInput = z.infer<typeof CourtSchema>
export type SlotInput = z.infer<typeof SlotInputSchema>
export type GymOfferInput = z.infer<typeof GymOfferSchema>
export type CrowdReportInput = z.infer<typeof CrowdReportInputSchema>
export type VenueFilter = z.infer<typeof VenueFilterSchema>
