-- ============================================================
-- CourtFinder – Initial Schema
-- Run in Supabase Dashboard → SQL Editor, or via supabase CLI:
--   supabase db push
-- ============================================================

-- Venues (Sportstätten)
CREATE TABLE IF NOT EXISTS venues (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  type        TEXT        NOT NULL CHECK (type IN ('tennis', 'padel', 'gym')),
  address     TEXT        NOT NULL,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  operator    TEXT,
  website     TEXT,
  phone       TEXT,
  photo_url   TEXT,
  source      TEXT        NOT NULL DEFAULT 'crowdsourced'
                CHECK (source IN ('partner', 'integration', 'crowdsourced', 'club_website')),
  active      BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Courts (einzelne Plätze – nur tennis/padel)
CREATE TABLE IF NOT EXISTS courts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id    UUID        NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  surface     TEXT        CHECK (surface IN ('sand', 'hartplatz', 'kunstrasen', 'teppich', 'beton')),
  indoor      BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Slots / Verfügbarkeit
CREATE TABLE IF NOT EXISTS slots (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id       UUID        REFERENCES courts(id) ON DELETE CASCADE,
  venue_id       UUID        REFERENCES venues(id) ON DELETE CASCADE,
  start_time     TIMESTAMPTZ NOT NULL,
  end_time       TIMESTAMPTZ NOT NULL,
  status         TEXT        NOT NULL DEFAULT 'unbekannt'
                   CHECK (status IN ('frei', 'belegt', 'unbekannt')),
  price_cents    INTEGER,    -- Preis in Cent; NULL = unbekannt
  source         TEXT        NOT NULL DEFAULT 'crowdsourced'
                   CHECK (source IN ('own', 'integration', 'scraper', 'crowdsourced')),
  last_updated   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT slot_has_court_or_venue CHECK (court_id IS NOT NULL OR venue_id IS NOT NULL),
  CONSTRAINT slot_end_after_start    CHECK (end_time > start_time)
);

-- Gym-Angebote
CREATE TABLE IF NOT EXISTS gym_offers (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id     UUID    NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  type         TEXT    NOT NULL CHECK (type IN ('tageskarte', 'probetraining')),
  price_cents  INTEGER,           -- NULL = kostenlos
  conditions   TEXT,
  valid_from   DATE,
  valid_until  DATE,
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crowd-Reports
CREATE TABLE IF NOT EXISTS crowd_reports (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id         UUID        REFERENCES venues(id) ON DELETE CASCADE,
  court_id         UUID        REFERENCES courts(id) ON DELETE CASCADE,
  reported_status  TEXT        NOT NULL CHECK (reported_status IN ('frei', 'belegt')),
  reported_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reporter_token   TEXT,       -- anonymes Session-Token, nie User-ID im MVP
  trust_score      REAL        NOT NULL DEFAULT 0.5 CHECK (trust_score BETWEEN 0 AND 1),
  CONSTRAINT report_has_target CHECK (venue_id IS NOT NULL OR court_id IS NOT NULL)
);

-- Placeholder-Tabellen für spätere Features (Schema vorbereitet, nicht ausgebaut)
-- users, favorites, bookings werden erst mit Auth-Phase angelegt

-- ============================================================
-- Indizes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_venues_type        ON venues(type);
CREATE INDEX IF NOT EXISTS idx_venues_active       ON venues(active);
CREATE INDEX IF NOT EXISTS idx_courts_venue        ON courts(venue_id);
CREATE INDEX IF NOT EXISTS idx_slots_court         ON slots(court_id);
CREATE INDEX IF NOT EXISTS idx_slots_venue         ON slots(venue_id);
CREATE INDEX IF NOT EXISTS idx_slots_start_time    ON slots(start_time);
CREATE INDEX IF NOT EXISTS idx_slots_status        ON slots(status);
CREATE INDEX IF NOT EXISTS idx_gym_offers_venue    ON gym_offers(venue_id);
CREATE INDEX IF NOT EXISTS idx_gym_offers_active   ON gym_offers(active);
CREATE INDEX IF NOT EXISTS idx_crowd_reports_venue ON crowd_reports(venue_id);
CREATE INDEX IF NOT EXISTS idx_crowd_reports_court ON crowd_reports(court_id);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE venues       ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots        ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_offers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE crowd_reports ENABLE ROW LEVEL SECURITY;

-- Public read for all tables
CREATE POLICY "public_read_venues"
  ON venues FOR SELECT USING (true);

CREATE POLICY "public_read_courts"
  ON courts FOR SELECT USING (true);

CREATE POLICY "public_read_slots"
  ON slots FOR SELECT USING (true);

CREATE POLICY "public_read_gym_offers"
  ON gym_offers FOR SELECT USING (true);

CREATE POLICY "public_read_crowd_reports"
  ON crowd_reports FOR SELECT USING (true);

-- Anyone can submit a crowd report (no auth required in MVP)
CREATE POLICY "public_insert_crowd_reports"
  ON crowd_reports FOR INSERT WITH CHECK (true);

-- Write access for venues/courts/slots/gym_offers is service-role only (no policy = deny for anon)
