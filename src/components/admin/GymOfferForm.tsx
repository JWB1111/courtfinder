'use client'

import { useState, useTransition } from 'react'
import { createGymOffer } from '@/actions/create-gym-offer'
import type { AdminVenue } from '@/lib/data/admin'

const FIELD =
  'w-full rounded-lg border border-ink-200 px-3 py-2 text-sm transition-colors hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20'
const LABEL = 'block text-sm font-medium text-ink-700'

export function GymOfferForm({ venues }: { venues: AdminVenue[] }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null)

  const gymVenues = venues.filter((v) => v.type === 'gym')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    startTransition(async () => {
      const r = await createGymOffer(fd)
      setResult(r)
      if (r.ok) form.reset()
    })
  }

  if (gymVenues.length === 0) {
    return (
      <p className="rounded-lg bg-ink-50 px-4 py-3 text-sm text-ink-500">
        Noch keine Gym-Venues vorhanden. Lege zuerst eine Venue vom Typ „Gym" an.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1">
        <label htmlFor="venue_id" className={LABEL}>
          Gym <span className="text-red-500">*</span>
        </label>
        <select id="venue_id" name="venue_id" required defaultValue="" className={FIELD}>
          <option value="" disabled>
            – Gym wählen –
          </option>
          {gymVenues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="type" className={LABEL}>
            Angebotstyp <span className="text-red-500">*</span>
          </label>
          <select id="type" name="type" required defaultValue="tageskarte" className={FIELD}>
            <option value="tageskarte">Tageskarte</option>
            <option value="probetraining">Probetraining</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="price_eur" className={LABEL}>
            Preis (EUR)
          </label>
          <input
            id="price_eur"
            name="price_eur"
            type="number"
            min="0"
            step="0.01"
            className={`${FIELD} tabular-nums`}
            placeholder="leer = kostenlos"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="conditions" className={LABEL}>
          Bedingungen
        </label>
        <textarea
          id="conditions"
          name="conditions"
          rows={2}
          className={FIELD}
          placeholder="z.B. Gültig Mo–Fr 9–18 Uhr. Kein Vertrag nötig."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
      >
        {isPending ? 'Wird gespeichert…' : 'Angebot anlegen'}
      </button>

      {result?.ok && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ✓ Angebot gespeichert.
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
