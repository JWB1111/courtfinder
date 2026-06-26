'use server'

import type { ReportedStatus } from '@/types/domain'

export interface CrowdReportResult {
  ok: boolean
  error?: string
}

export async function submitCrowdReport(
  venueId: string,
  courtId: string | null,
  reportedStatus: ReportedStatus
): Promise<CrowdReportResult> {
  if (process.env.NEXT_PUBLIC_IS_MOCK === 'true') {
    return { ok: true }
  }

  try {
    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const { error } = await supabase.from('crowd_reports').insert({
      venue_id: venueId,
      court_id: courtId,
      reported_status: reportedStatus,
      reported_at: new Date().toISOString(),
      trust_score: 1,
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Unbekannter Fehler' }
  }
}
