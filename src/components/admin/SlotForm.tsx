'use client'

import { useState, useTransition } from 'react'
import { createSlot } from '@/actions/create-slot'
import type { AdminVenue } from '@/lib/data/admin'
import type { Court } from '@/types/domain'

const FIELD =
  'w-full rounded-lg border border-ink-200 px-3 py-2 text-sm transition-colors hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20'
const LABEL = 'block text-sm font-medium text-ink-700'

type SlotCourt = Pick<Court, 'id' | 'venue_id' | 'name' | 'indoor'>

export function SlotForm({ venues, courts }: { venues: AdminVenue[]; courts: SlotCourt[] }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ ok: boolean; error?: string; id?: string } | null>(null)
  const [selectedVenueId, setSelectedVenueId] = useState('')

  const courtVenues = venues.filter((v) => v.type !== 'gym')
  const venueCourts = courts.filter((c) => c.venue_id === selectedVenueId)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    startTransition(async () => {
      const r = await createSlot(fd)
      setResult(r)
      if (r.ok) {
        form.reset()
        setSelectedVenueId('')
      }
    })
  }

  if (courtVenues.length === 0) {
    return (
      <p className="rounded-lg bg-ink-50 px-4 py-3 text-sm text-ink-500">
        Noch keine Tennis-/Padel-Venues mit Plätzen vorhanden. Lege zuerst Venue und Platz an.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Venue */}
      <div className="space-y-1">
        <label htmlFor="venue_id" className={LABEL}>
          Venue <span className="text-red-500">*</span>
        </label>
        <select
          id="venue_id"
          name="venue_id"
          required
          value={selectedVenueId}
          onChange={(e) => setSelectedVenueId(e.target.value)}
          className={FIELD}
        >
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

      {/* Court */}
      <div className="space-y-1">
        <label htmlFor="court_id" className={LABEL}>
          Platz <span className="text-red-500">*</span>
        </label>
        <select id="court_id" name="court_id" required defaultValue="" className={FIELD} disabled={!selectedVenueId}>
          <option value="" disabled>
            {selectedVenueId ? '– Platz wählen –' : 'erst Venue wählen'}
          </option>
          {venueCourts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.indoor ? ' (Halle)' : ''}
            </option>
          ))}
        </select>
        {selectedVenueId && venueCourts.length === 0 && (
          <p className="text-xs text-red-600">
            Diese Venue hat noch keine Plätze – lege zuerst einen Platz an.
          </p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-1">
        <label htmlFor="date" className={LABEL}>
          Datum <span className="text-red-500">*</span>
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className={FIELD}
        />
      </div>

      {/* Times */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="start_time" className={LABEL}>
            Start (UTC) <span className="text-red-500">*</span>
          </label>
          <input id="start_time" name="start_time" type="time" required className={FIELD} />
        </div>
        <div className="space-y-1">
          <label htmlFor="end_time" className={LABEL}>
            Ende (UTC) <span className="text-red-500">*</span>
          </label>
          <input id="end_time" name="end_time" type="time" required className={FIELD} />
        </div>
      </div>
      <p className="text-xs text-ink-400">
        Zeiten in UTC. Aachen = UTC+1 (Winter) bzw. UTC+2 (Sommer) – also z.B. 18:00 Ortszeit im
        Sommer = 16:00 UTC.
      </p>

      {/* Status + Price */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="status" className={LABEL}>
            Status <span className="text-red-500">*</span>
          </label>
          <select id="status" name="status" required defaultValue="frei" className={FIELD}>
            <option value="frei">Frei</option>
            <option value="belegt">Belegt</option>
            <option value="unbekannt">Unbekannt</option>
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
            placeholder="z.B. 12.00"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || !selectedVenueId || venueCourts.length === 0}
        className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
      >
        {isPending ? 'Wird gespeichert…' : 'Slot anlegen'}
      </button>

      {result?.ok && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ✓ Slot gespeichert{result.id ? ` (ID: ${result.id.slice(0, 8)}…)` : ''}.
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
