# Claude-Code-Prompt: "CourtFinder" – Web-App für freie Tennis-/Padelplätze & Gym-Tageskarten

> **So benutzt du das hier:** Kopiere den Block unten (alles ab „=== PROMPT START ===") in Claude Code.
> Ersetze vorher die Platzhalter in `[eckigen Klammern]` (v.a. `[DEINE STADT]`).
> Arbeite den Prompt **nicht in einem Rutsch** ab – Claude Code soll ihn Phase für Phase umsetzen
> und nach jeder Phase die Zwischentests laufen lassen (siehe Checkliste).

---

=== PROMPT START ===

## Rolle & Ziel

Du bist Senior Full-Stack-Entwickler. Wir bauen gemeinsam das MVP einer Web-App namens **„CourtFinder"** (Arbeitstitel). Sie hilft Nutzern in **[Aachen]**, kurzfristig **freie Tennis- und Padelplätze** zu finden und **Gyms mit Tageskarten oder kostenlosen Probetrainings** zu entdecken – tageszeit-spezifisch.

Wir starten **bewusst klein und web-basiert**, aber so, dass eine spätere native App (React Native) und weitere Features (QR-Code-Tageskarten, Nutzerkonten, Buchung) sauber aufgesetzt werden können. **Lieber wenige Features, die sauber funktionieren und getestet sind, als viele halbfertige.**

## Wichtigste Arbeitsregeln (bitte strikt einhalten)

1. **Arbeite in Phasen.** Setze immer nur EINE Phase um (siehe „Phasenplan"). Halte nach jeder Phase an, führe die Zwischentests aus, zeige mir das Ergebnis und warte auf mein „OK / weiter", bevor du die nächste Phase startest.
2. **Teste nach jeder Phase.** Schreibe und führe automatisierte Tests aus (Unit + relevante Integrationstests) UND beschreibe einen manuellen Smoke-Test, den ich selbst im Browser nachklicken kann. Nenne explizit, was getestet wurde und ob es grün ist.
3. **Keine erfundenen Daten in Produktion.** Mock-Daten klar als solche kennzeichnen (z.B. `seed/`-Ordner, `IS_MOCK`-Flag), damit sie später leicht durch echte Quellen ersetzt werden.
4. **Erkläre Architekturentscheidungen kurz**, bevor du Code schreibst, wenn es mehrere sinnvolle Wege gibt.
5. **Halte es wartbar:** TypeScript überall, klare Ordnerstruktur, sprechende Namen, kommentiere nur wo nötig.
6. **Frag nach, statt zu raten,** wenn eine Anforderung unklar ist.
7. **Commit-Disziplin:** Pro Phase ein sauberer Git-Commit mit aussagekräftiger Message.

## Tech-Stack (fix vorgegeben)

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend / DB / Auth:** Supabase (PostgreSQL, Row Level Security, Auth, Storage)
- **Karte:** MapLibre GL oder Leaflet mit OpenStreetMap-Tiles (kostenlos, kein Vendor-Lock-in)
- **Tests:** Vitest (Unit) + Playwright (E2E/Smoke)
- **Deployment:** Vercel (Frontend) + Supabase Cloud
- **Datenvalidierung:** Zod
- **Code-Qualität:** ESLint + Prettier

Begründe kurz, falls du an einer Stelle stark abweichen willst.

## Domänen-Datenmodell (Startpunkt – gern verfeinern)

- **Venue** (Sportstätte): id, name, type (`tennis` | `padel` | `gym`), adresse, lat, lng, betreiber, website, telefon, foto_url, quelle (`partner` | `integration` | `crowdsourced` | `club_website`), aktiv
- **Court** (einzelner Platz, nur für tennis/padel): id, venue_id, name/nummer, surface (z.B. sand, hartplatz, halle, outdoor)
- **Availability / Slot:** id, court_id (oder venue_id), start, ende, status (`frei` | `belegt` | `unbekannt`), preis, quelle, zuletzt_aktualisiert
- **GymOffer:** id, venue_id, typ (`tageskarte` | `probetraining`), preis, bedingungen, gueltig_von, gueltig_bis
- **CrowdReport:** id, venue_id/court_id, gemeldeter_status, zeitpunkt, melder (optional), vertrauens-score
- **(später) User, Favorite, Booking, DayPass/QR** – nur als Schema vorbereiten, noch nicht ausbauen

## Datenquellen-Strategie (mehrstufig, das ist der schwierigste Teil)

Die Verfügbarkeitsdaten kommen aus **mehreren Quellen** mit klarer Priorität. Baue eine **Adapter-/Provider-Architektur**, sodass jede Quelle ein austauschbares Modul ist, das ein einheitliches `Slot`-Format liefert:

1. **Integration bestehender Buchungssysteme** (z.B. eversports, Playtomic) – über offizielle API falls verfügbar, sonst als späterer Scraper-Adapter. **Im MVP: Schnittstelle/Interface definieren, einen Beispiel-Adapter stubben.**
2. **Eigene Slot-Daten** – Betreiber/Vereine pflegen Slots direkt ein (einfaches internes Eingabeformular, später Partner-Login).
3. **Vereins-Websites** – konfigurierbarer Scraper-Adapter pro Verein (robust gegen Layout-Änderungen, mit Caching, respektiere robots.txt & Rate-Limits). **Im MVP: Architektur + 1 Beispiel-Adapter, klar als experimentell markiert.**
4. **Crowdsourcing** – Nutzer melden „frei/belegt"; mit Vertrauens-/Zeitgewichtung.

**Für das MVP reicht:** einheitliches Provider-Interface + Mock-/Seed-Daten + ein internes Eingabeformular für eigene Slots. Echte Integrationen/Scraper folgen später, dürfen das Modell aber nicht sprengen.

> ⚖️ **Rechtlicher Hinweis, den du beachten sollst:** Beim Scraping & bei API-Integrationen Nutzungsbedingungen, robots.txt und DSGVO berücksichtigen. Markiere im Code, wo rechtliche Prüfung nötig ist, und weise mich aktiv darauf hin.

## MVP-Funktionsumfang (Phase-Ziel)

**Im MVP enthalten:**
- Karten- **und** Listenansicht von Venues in **[DEINE STADT]**
- Filter: Sportart (Tennis/Padel/Gym), **Tageszeit/Zeitfenster** (heute, jetzt, heute Abend, Datum+Uhrzeit), Umkreis/Standort, „nur freie Plätze", Hallenplatz/Outdoor, Preis
- **Gym-Filter:** „bietet Tageskarte", „bietet kostenloses Probetraining"
- Venue-Detailseite: Slots/Verfügbarkeit, Adresse, Karte, Link zum Betreiber, Gym-Angebote
- Standortbasierte Sortierung (Geolocation, mit Fallback auf Stadt-Zentrum)
- Crowd-Report-Button („Platz ist frei/belegt") – einfache Variante
- Responsives Design (mobile-first, da spätere App)

**Bewusst NICHT im MVP (nur Schema/Architektur vorbereiten):**
- Nutzerkonten/Login
- QR-Code-Tageskarten & Gym-Kooperationsabwicklung
- Echte Buchung/Bezahlung
- Push-Benachrichtigungen

## Phasenplan (jeweils mit Stopp + Zwischentest)

**Phase 0 – Setup & Gerüst**
Next.js + TS + Tailwind + ESLint/Prettier, Supabase-Projekt anlegen, Env-Konfiguration, leeres Deploy auf Vercel. → *Zwischentest:* App startet lokal, „Hello CourtFinder"-Seite live, Lint grün.

**Phase 1 – Datenmodell & Seed**
Supabase-Tabellen + RLS-Policies (vorerst nur Lesen öffentlich), Zod-Schemas, Seed-Skript mit klar markierten Mock-Venues/Courts/Slots/Gym-Angeboten für **[DEINE STADT]**. → *Zwischentest:* Seed läuft, Daten per Supabase-Query abrufbar, Schema-Validierung getestet.

**Phase 2 – Provider-/Adapter-Layer**
Einheitliches `AvailabilityProvider`-Interface; Implementierungen: `MockProvider`, `OwnSlotsProvider` (liest eigene DB-Slots), Stubs für `IntegrationProvider` & `ClubWebsiteScraperProvider`. Aggregations-/Dedupe-Logik. → *Zwischentest:* Unit-Tests für Aggregation/Dedupe/Zeitfilter, ein End-to-End-Aufruf liefert kombinierte Slots.

**Phase 3 – Listenansicht & Filter**
Venue-Liste mit allen Filtern (Sportart, Tageszeit, Umkreis, „nur frei", Gym-Tageskarte/Probetraining). → *Zwischentest:* Filter-Logik unit-getestet; manueller Smoke-Test: Filter ändern → Liste aktualisiert korrekt.

**Phase 4 – Kartenansicht**
MapLibre/Leaflet-Karte mit Markern, Klick → Venue-Vorschau, Sync mit Filtern, Geolocation. → *Zwischentest:* Karte rendert Marker aus gefilterten Daten; Geolocation-Fallback funktioniert.

**Phase 5 – Venue-Detailseite**
Slots/Verfügbarkeit nach Tageszeit, Gym-Angebote, Crowd-Report-Button (schreibt in DB). → *Zwischentest:* Detailseite zeigt korrekte Slots; Crowd-Report schreibt Eintrag; E2E-Happy-Path mit Playwright grün.

**Phase 6 – Polish, internes Slot-Eingabeformular, Deploy**
Internes Formular zum Pflegen eigener Slots, leere Zustände/Fehlerzustände, Loading-States, finales Deploy. → *Zwischentest:* Vollständiger E2E-Durchlauf (Start → Filter → Karte → Detail → Report) grün auf Production-URL.

## Definition of Done pro Phase

- [ ] Code geschrieben, TypeScript ohne Fehler, Lint grün
- [ ] Automatisierte Tests geschrieben **und grün**
- [ ] Manueller Smoke-Test beschrieben (Klick-für-Klick)
- [ ] Kurzes Changelog: was wurde gebaut, was ist offen, was sind nächste Schritte
- [ ] Sauberer Git-Commit
- [ ] Du hast mir explizit „Phase X fertig – Tests grün – bereit für Phase X+1?" gemeldet und auf mein OK gewartet

## Jetzt starten

Bestätige zuerst kurz dein Verständnis, liste offene Annahmen/Rückfragen auf, und **beginne dann mit Phase 0**. Stopp danach und zeig mir die Zwischentest-Ergebnisse.

=== PROMPT END ===
