-- ============================================================
-- CourtFinder – Crowd-Reports: anonymes INSERT erlauben
-- ============================================================
-- Stellt sicher, dass anonyme Nutzer (Rolle `anon`) Crowd-Reports
-- EINFÜGEN dürfen, aber weiterhin KEIN Update/Delete.
--
-- Hintergrund: 001_initial_schema.sql legt diese Policy bereits an.
-- Diese Migration ist idempotent und repariert Live-Datenbanken,
-- die vor 001 angelegt wurden bzw. die Policy nicht erhalten haben.
--
-- Run: Supabase Dashboard → SQL Editor, oder `supabase db push`
-- ============================================================

ALTER TABLE crowd_reports ENABLE ROW LEVEL SECURITY;

-- Alte Variante (Rolle `public`) entfernen, damit die Policy
-- explizit auf anon + authenticated eingegrenzt werden kann.
DROP POLICY IF EXISTS "public_insert_crowd_reports" ON crowd_reports;
DROP POLICY IF EXISTS "anon_insert_crowd_reports"   ON crowd_reports;

-- INSERT für anonyme und eingeloggte Nutzer.
-- WITH CHECK erzwingt, dass mindestens ein Ziel gesetzt ist –
-- denselben Invariant prüft auch der CHECK-Constraint `report_has_target`.
CREATE POLICY "anon_insert_crowd_reports"
  ON crowd_reports
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (venue_id IS NOT NULL OR court_id IS NOT NULL);

-- Bewusst KEINE UPDATE-/DELETE-Policy:
-- ohne passende Policy verweigert RLS diese Operationen für anon/authenticated.
-- Korrekturen/Löschungen laufen ausschließlich über den service_role-Key.

-- SELECT bleibt öffentlich (Policy aus 001_initial_schema.sql).
