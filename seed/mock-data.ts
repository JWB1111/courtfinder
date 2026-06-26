/**
 * MOCK DATA – nur für Entwicklung & Demo.
 * IS_MOCK=true in .env.local, damit diese Daten nie unbemerkt in Produktion landen.
 *
 * Venues: echte Aachener Orte (öffentlich bekannte Informationen).
 * Slots & Angebote: ERFUNDEN – dienen nur als Platzhalter für die UI-Entwicklung.
 */

import { addHours, addDays, setHours, setMinutes, startOfDay } from 'date-fns'

// ── Feste UUIDs für Seed-Reproduzierbarkeit ────────────────────────────────

// Valid RFC 4122 v4 UUIDs (version=4, variant=8x) for reproducible seeds
export const VENUE_IDS = {
  GW_AACHEN: 'a1000000-0000-4000-8000-000000000001',
  TC_RWTH: 'a1000000-0000-4000-8000-000000000002',
  TC_BRAND: 'a1000000-0000-4000-8000-000000000003',
  PADEL_AACHEN: 'a1000000-0000-4000-8000-000000000004',
  FITONE_AACHEN: 'a1000000-0000-4000-8000-000000000005',
  MCFIT_AACHEN: 'a1000000-0000-4000-8000-000000000006',
  FITX_AACHEN: 'a1000000-0000-4000-8000-000000000007',
} as const

export const COURT_IDS = {
  GW_1: 'c1000000-0000-4000-8000-000000000001',
  GW_2: 'c1000000-0000-4000-8000-000000000002',
  GW_3: 'c1000000-0000-4000-8000-000000000003',
  RWTH_1: 'c1000000-0000-4000-8000-000000000004',
  RWTH_2: 'c1000000-0000-4000-8000-000000000005',
  BRAND_1: 'c1000000-0000-4000-8000-000000000006',
  BRAND_2: 'c1000000-0000-4000-8000-000000000007',
  PADEL_1: 'c1000000-0000-4000-8000-000000000008',
  PADEL_2: 'c1000000-0000-4000-8000-000000000009',
} as const

// ── Venues ─────────────────────────────────────────────────────────────────

export const MOCK_VENUES = [
  {
    id: VENUE_IDS.GW_AACHEN,
    name: 'TC Grün-Weiss Aachen',
    type: 'tennis' as const,
    address: 'Branderhofer Weg 45, 52078 Aachen',
    lat: 50.7831,
    lng: 6.1387,
    operator: 'TC Grün-Weiss Aachen e.V.',
    website: 'https://www.tc-gruen-weiss-aachen.de',
    phone: null,
    photo_url: null,
    source: 'club_website' as const,
    active: true,
  },
  {
    id: VENUE_IDS.TC_RWTH,
    name: 'TC RWTH Aachen',
    type: 'tennis' as const,
    address: 'Seffenter Weg 17, 52074 Aachen',
    lat: 50.7779,
    lng: 6.0618,
    operator: 'Hochschulsport RWTH Aachen',
    website: 'https://www.hochschulsport.rwth-aachen.de',
    phone: null,
    photo_url: null,
    source: 'club_website' as const,
    active: true,
  },
  {
    id: VENUE_IDS.TC_BRAND,
    name: 'Tennisanlage Aachen-Brand',
    type: 'tennis' as const,
    address: 'Zum Weiher 12, 52078 Aachen',
    lat: 50.7642,
    lng: 6.1512,
    operator: null,
    website: null,
    phone: null,
    photo_url: null,
    source: 'crowdsourced' as const,
    active: true,
  },
  {
    id: VENUE_IDS.PADEL_AACHEN,
    name: 'Padel Aachen',
    type: 'padel' as const,
    address: 'Eupener Str. 157, 52066 Aachen',
    lat: 50.7701,
    lng: 6.0923,
    operator: 'Padel Aachen GmbH',
    website: null,
    phone: null,
    photo_url: null,
    source: 'crowdsourced' as const,
    active: true,
  },
  {
    id: VENUE_IDS.FITONE_AACHEN,
    name: 'FitOne Aachen',
    type: 'gym' as const,
    address: 'Adalbertstr. 33, 52062 Aachen',
    lat: 50.774,
    lng: 6.0888,
    operator: 'FitOne GmbH',
    website: 'https://www.fit-one.de',
    phone: null,
    photo_url: null,
    source: 'partner' as const,
    active: true,
  },
  {
    id: VENUE_IDS.MCFIT_AACHEN,
    name: 'McFit Aachen',
    type: 'gym' as const,
    address: 'Trierer Str. 594, 52078 Aachen',
    lat: 50.7583,
    lng: 6.1369,
    operator: 'RSG Group GmbH',
    website: 'https://www.mcfit.com',
    phone: null,
    photo_url: null,
    source: 'partner' as const,
    active: true,
  },
  {
    id: VENUE_IDS.FITX_AACHEN,
    name: 'FitX Aachen',
    type: 'gym' as const,
    address: 'Roermonder Str. 401, 52072 Aachen',
    lat: 50.7867,
    lng: 6.0743,
    operator: 'FitX GmbH',
    website: 'https://www.fitx.de',
    phone: null,
    photo_url: null,
    source: 'partner' as const,
    active: true,
  },
]

// ── Courts ─────────────────────────────────────────────────────────────────

export const MOCK_COURTS = [
  {
    id: COURT_IDS.GW_1,
    venue_id: VENUE_IDS.GW_AACHEN,
    name: 'Platz 1',
    surface: 'sand' as const,
    indoor: false,
  },
  {
    id: COURT_IDS.GW_2,
    venue_id: VENUE_IDS.GW_AACHEN,
    name: 'Platz 2',
    surface: 'sand' as const,
    indoor: false,
  },
  {
    id: COURT_IDS.GW_3,
    venue_id: VENUE_IDS.GW_AACHEN,
    name: 'Platz 3 (Halle)',
    surface: 'teppich' as const,
    indoor: true,
  },
  {
    id: COURT_IDS.RWTH_1,
    venue_id: VENUE_IDS.TC_RWTH,
    name: 'Platz 1',
    surface: 'hartplatz' as const,
    indoor: false,
  },
  {
    id: COURT_IDS.RWTH_2,
    venue_id: VENUE_IDS.TC_RWTH,
    name: 'Platz 2',
    surface: 'hartplatz' as const,
    indoor: false,
  },
  {
    id: COURT_IDS.BRAND_1,
    venue_id: VENUE_IDS.TC_BRAND,
    name: 'Platz 1',
    surface: 'sand' as const,
    indoor: false,
  },
  {
    id: COURT_IDS.BRAND_2,
    venue_id: VENUE_IDS.TC_BRAND,
    name: 'Platz 2',
    surface: 'sand' as const,
    indoor: false,
  },
  {
    id: COURT_IDS.PADEL_1,
    venue_id: VENUE_IDS.PADEL_AACHEN,
    name: 'Padelcourt 1',
    surface: 'kunstrasen' as const,
    indoor: true,
  },
  {
    id: COURT_IDS.PADEL_2,
    venue_id: VENUE_IDS.PADEL_AACHEN,
    name: 'Padelcourt 2',
    surface: 'kunstrasen' as const,
    indoor: true,
  },
]

// ── Slots (ERFUNDEN – Mock-Daten) ───────────────────────────────────────────

let slotSeq = 1
function slotId() {
  const n = slotSeq++
  return `d1000000-0000-4000-8000-${String(n).padStart(12, '0')}`
}

function slot(
  courtId: string | null,
  venueId: string | null,
  startHour: number,
  daysFromNow: number,
  status: 'frei' | 'belegt' | 'unbekannt',
  priceCents: number | null
) {
  const base = setMinutes(setHours(addDays(startOfDay(new Date()), daysFromNow), startHour), 0)
  return {
    id: slotId(),
    court_id: courtId,
    venue_id: venueId,
    start_time: base.toISOString(),
    end_time: addHours(base, 1).toISOString(),
    status,
    price_cents: priceCents,
    source: 'own' as const,
    last_updated: new Date().toISOString(),
  }
}

export const MOCK_SLOTS = [
  // TC Grün-Weiss – Platz 1
  slot(COURT_IDS.GW_1, null, 9, 0, 'frei', 1200),
  slot(COURT_IDS.GW_1, null, 10, 0, 'belegt', 1200),
  slot(COURT_IDS.GW_1, null, 11, 0, 'frei', 1200),
  slot(COURT_IDS.GW_1, null, 14, 0, 'frei', 1200),
  slot(COURT_IDS.GW_1, null, 17, 0, 'belegt', 1200),
  slot(COURT_IDS.GW_1, null, 9, 1, 'frei', 1200),
  slot(COURT_IDS.GW_1, null, 10, 1, 'frei', 1200),
  // TC Grün-Weiss – Platz 2
  slot(COURT_IDS.GW_2, null, 9, 0, 'belegt', 1200),
  slot(COURT_IDS.GW_2, null, 10, 0, 'frei', 1200),
  slot(COURT_IDS.GW_2, null, 11, 0, 'belegt', 1200),
  // TC Grün-Weiss – Halle (Platz 3)
  slot(COURT_IDS.GW_3, null, 18, 0, 'frei', 1500),
  slot(COURT_IDS.GW_3, null, 19, 0, 'belegt', 1500),
  slot(COURT_IDS.GW_3, null, 20, 0, 'frei', 1500),
  // TC RWTH – Platz 1
  slot(COURT_IDS.RWTH_1, null, 10, 0, 'frei', 800),
  slot(COURT_IDS.RWTH_1, null, 12, 0, 'belegt', 800),
  slot(COURT_IDS.RWTH_1, null, 16, 0, 'frei', 800),
  // Padel Aachen – Court 1
  slot(COURT_IDS.PADEL_1, null, 10, 0, 'frei', 2000),
  slot(COURT_IDS.PADEL_1, null, 11, 0, 'frei', 2000),
  slot(COURT_IDS.PADEL_1, null, 14, 0, 'belegt', 2000),
  slot(COURT_IDS.PADEL_1, null, 18, 0, 'frei', 2000),
  // Padel Aachen – Court 2
  slot(COURT_IDS.PADEL_2, null, 10, 0, 'belegt', 2000),
  slot(COURT_IDS.PADEL_2, null, 11, 0, 'frei', 2000),
  slot(COURT_IDS.PADEL_2, null, 19, 0, 'frei', 2000),
]

// ── Gym-Angebote (ERFUNDEN – Mock-Daten) ────────────────────────────────────

export const MOCK_GYM_OFFERS = [
  {
    id: 'e1000000-0000-4000-8000-000000000001',
    venue_id: VENUE_IDS.FITONE_AACHEN,
    type: 'tageskarte' as const,
    price_cents: 1490,
    conditions: 'Gültig Mo–Fr 9–18 Uhr. Kein Vertrag nötig.',
    valid_from: null,
    valid_until: null,
    active: true,
  },
  {
    id: 'e1000000-0000-4000-8000-000000000002',
    venue_id: VENUE_IDS.FITONE_AACHEN,
    type: 'probetraining' as const,
    price_cents: 0,
    conditions: 'Einmalig kostenlos für Neukunden.',
    valid_from: null,
    valid_until: null,
    active: true,
  },
  {
    id: 'e1000000-0000-4000-8000-000000000003',
    venue_id: VENUE_IDS.MCFIT_AACHEN,
    type: 'tageskarte' as const,
    price_cents: 1990,
    conditions: 'Tagesgast-Ticket an der Theke erhältlich. Ausweis mitbringen.',
    valid_from: null,
    valid_until: null,
    active: true,
  },
  {
    id: 'e1000000-0000-4000-8000-000000000004',
    venue_id: VENUE_IDS.FITX_AACHEN,
    type: 'probetraining' as const,
    price_cents: 0,
    conditions: 'Kostenloses Probetraining, einmalig, ohne Anmeldung.',
    valid_from: null,
    valid_until: null,
    active: true,
  },
]
