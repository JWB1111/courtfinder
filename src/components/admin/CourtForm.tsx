'use client'

import { useState, useTransition } from 'react'
import { createCourt } from '@/actions/create-court'
import type { AdminVenue } from '@/lib/data/admin'

const FIELD =
  'w-full rounded-lg border border-ink-200 px-3 py-2 text-sm transition-colors hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20'
const LABEL = 'block text-sm font-medium text-ink-700'

export function CourtForm({ venues }: { venues: AdminVenue[] }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null)

  // Courts only make sense for tennis / padel venues
  const courtVenues = venues.filter((v) => v.type !== 'gym')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    startTransition(async () => {
      const r = await createCourt(fd)
      setResult(r)
      if (r.ok) form.reset()
    })
  }

  if (courtVenues.length === 0) {
    return (
      <p className="rounded-lg bg-ink-50 px-4 py-3 text-sm text-ink-500">
        Noch keine Tennis-/Padel-Venues vorhanden. Lege zuerst eine Venue an.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1">
        <label htmlFor="venue_id" className={LABEL}>
          Venue <span className="text-red-500">*</span>
        </label>
        <select id="venue_id" name="venue_id" required defaultValue="" className={FIELD}>
          <option value="" disabled>
            – Venue wählen –
          </option>
          {courtVenues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.type})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="name" className={LABEL}>
          Platzname <span className="text-red-500">*</span>
        </label>
        <input id="name" name="name" required className={FIELD} placeholder="z.B. Platz 1 / Halle 1" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="surface" className={LABEL}>
            Belag
          </label>
          <select id="surface" name="surface" defaultValue="" className={FIELD}>
            <option value="">– keine Angabe –</option>
            <option value="sand">Sand</option>
            <option value="hartplatz">Hartplatz</option>
            <option value="kunstrasen">Kunstrasen</option>
            <option value="teppich">Teppich</option>
            <option value="beton">Beton</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="inline-flex cursor-pointer items-center gap-2 py-2 text-sm text-ink-700">
            <input
              type="checkbox"
              name="indoor"
              className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500/30"
            />
            Hallenplatz (indoor)
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
      >
        {isPending ? 'Wird gespeichert…' : 'Platz anlegen'}
      </button>

      {result?.ok && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ✓ Platz gespeichert. Du kannst jetzt Slots dafür eintragen.
        </div>
      )}
      {result && !result.ok && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Fehler: {result.error}
        </div>
      )}
    </form>
  )
}
