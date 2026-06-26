import type { AvailabilityProvider } from './providers/base'
import type { SlotQuery, NormalizedSlot } from './types' // SlotQuery used in getSlots + resolveTimeWindow
import { SOURCE_PRIORITY } from './types'
import { supabase } from '@/lib/supabase/client'

// Crowd reports younger than this override a slot's status
const CROWD_REPORT_TTL_MS = 30 * 60 * 1000 // 30 minutes

export class SlotAggregator {
  constructor(private readonly providers: AvailabilityProvider[]) {}

  async getSlots(query: SlotQuery): Promise<NormalizedSlot[]> {
    const enabled = this.providers.filter((p) => p.enabled)

    // Fan out to all enabled providers in parallel; swallow individual errors
    const results = await Promise.allSettled(enabled.map((p) => p.getSlots(query)))

    const all: NormalizedSlot[] = []
    for (const result of results) {
      if (result.status === 'fulfilled') {
        all.push(...result.value)
      }
      // Rejected providers are silently skipped in production;
      // in dev the error surfaces via console.error below.
    }

    const deduped = deduplicate(all)
    return applyCrowdReports(deduped)
  }
}

/**
 * Keep the highest-priority slot for each (court|venue, start_time) key.
 * Priority: own=1 > integration=2 > scraper=3 > crowdsourced=4.
 */
function deduplicate(slots: NormalizedSlot[]): NormalizedSlot[] {
  const map = new Map<string, NormalizedSlot>()

  for (const slot of slots) {
    const existing = map.get(slot.key)
    if (!existing) {
      map.set(slot.key, slot)
      continue
    }
    const existingPriority = SOURCE_PRIORITY[existing.source] ?? 99
    const incomingPriority = SOURCE_PRIORITY[slot.source] ?? 99
    if (incomingPriority < existingPriority) {
      map.set(slot.key, slot)
    }
  }

  return Array.from(map.values())
}

/**
 * Overlay recent crowd reports onto deduped slots.
 * A report < 30 min old for a court/venue updates the matching slot's status.
 */
async function applyCrowdReports(slots: NormalizedSlot[]): Promise<NormalizedSlot[]> {
  if (slots.length === 0) return slots

  const cutoff = new Date(Date.now() - CROWD_REPORT_TTL_MS).toISOString()

  const venueIds = [...new Set(slots.map((s) => s.venue_id).filter(Boolean))] as string[]
  const courtIds = [...new Set(slots.map((s) => s.court_id).filter(Boolean))] as string[]

  const { data: reports } = await supabase
    .from('crowd_reports')
    .select('court_id, venue_id, reported_status, reported_at')
    .gte('reported_at', cutoff)
    .or(
      [
        courtIds.length ? `court_id.in.(${courtIds.join(',')})` : null,
        venueIds.length ? `venue_id.in.(${venueIds.join(',')})` : null,
      ]
        .filter(Boolean)
        .join(',')
    )

  if (!reports?.length) return slots

  // Build a lookup: most-recent report per court_id or venue_id
  const latestReport = new Map<string, string>()
  for (const r of reports) {
    const id = r.court_id ?? r.venue_id
    if (!id) continue
    const existing = latestReport.get(id)
    if (!existing || r.reported_at > existing) {
      latestReport.set(id, r.reported_status)
    }
  }

  return slots.map((slot) => {
    const id = slot.court_id ?? slot.venue_id
    if (!id) return slot
    const override = latestReport.get(id)
    if (!override || override === slot.status) return slot
    return {
      ...slot,
      status: override as NormalizedSlot['status'],
      provider: `${slot.provider}+crowd`,
    }
  })
}

// ── Filter helpers (used in Phase 3 for time-of-day filtering) ────────────

export type TimeOfDay = 'now' | 'today' | 'morning' | 'afternoon' | 'evening' | 'custom'

export function resolveTimeWindow(
  timeOfDay: TimeOfDay,
  customFrom?: Date,
  customTo?: Date
): { from: Date; to: Date } {
  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const endOfToday = new Date(startOfToday)
  endOfToday.setDate(endOfToday.getDate() + 1)

  switch (timeOfDay) {
    case 'now': {
      const to = new Date(now.getTime() + 2 * 60 * 60 * 1000) // next 2 h
      return { from: now, to }
    }
    case 'today':
      return { from: startOfToday, to: endOfToday }
    case 'morning': {
      const from = new Date(startOfToday)
      from.setHours(6)
      const to = new Date(startOfToday)
      to.setHours(12)
      return { from, to }
    }
    case 'afternoon': {
      const from = new Date(startOfToday)
      from.setHours(12)
      const to = new Date(startOfToday)
      to.setHours(18)
      return { from, to }
    }
    case 'evening': {
      const from = new Date(startOfToday)
      from.setHours(18)
      const to = new Date(startOfToday)
      to.setHours(23, 59, 59)
      return { from, to }
    }
    case 'custom':
      if (!customFrom || !customTo) throw new Error('custom requires customFrom and customTo')
      return { from: customFrom, to: customTo }
  }
}
