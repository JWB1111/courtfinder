'use client'

import { useTransition, useState } from 'react'
import { submitCrowdReport } from '@/actions/crowd-report'
import type { ReportedStatus } from '@/types/domain'

interface Props {
  venueId: string
  courtId?: string | null
}

export function CrowdReportButton({ venueId, courtId = null }: Props) {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState<ReportedStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  function report(status: ReportedStatus) {
    setError(null)
    startTransition(async () => {
      const result = await submitCrowdReport(venueId, courtId, status)
      if (result.ok) {
        setSent(status)
      } else {
        setError(result.error ?? 'Fehler beim Senden')
      }
    })
  }

  if (sent) {
    return (
      <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
        ✓ Gemeldet: {sent === 'frei' ? 'Platz ist frei' : 'Platz ist belegt'} – Danke!
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={() => report('frei')}
          disabled={isPending}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          Frei
        </button>
        <button
          onClick={() => report('belegt')}
          disabled={isPending}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          Belegt
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
