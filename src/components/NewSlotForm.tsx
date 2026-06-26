'use client'

import { useState, useTransition } from 'react'
import { createSlot } from '@/actions/create-slot'
import type { Venue, Court } from '@/types/domain'

interface Props {
  venues: Pick<Venue, 'id' | 'name' | 'type'>[]
  courts: Pick<Court, 'id' | 'venue_id' | 'name'>[]
  isMock: boolean
}

export function NewSlotForm({ venues, courts, isMock }: Props) {
  const [selectedVenueId, setSelectedVenueId] = useState('')
  const [result, setResult] = useState<{ ok: boolean; error?: string; id?: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const venueCourts = courts.filter((c) => c.venue_id === selectedVenueId)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const r = await createSlot(fd)
      setResult(r)
      if (r.ok) {
        ;(e.target as HTMLFormElement).reset()
        setSelectedVenueId('')
      }
    })
  }

  if (isMock) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-sm text-yellow-800 space-y-1">
        <p className="font-semibold">Mock-Modus aktiv</p>
        <p>
          Das Formular ist nur im Live-Betrieb verfügbar. Setze{' '}
          <code className="rounded bg-yellow-100 px-1">NEXT_PUBLIC_IS_MOCK=false</code> in{' '}
          <code className="rounded bg-yellow-100 px-1">.env.local</code>, um Slots in Supabase zu
          schreiben.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Venue */}
      <div className="space-y-1">
        <label htmlFor="venue_id" className="block text-sm font-medium text-gray-700">
          Venue <span className="text-red-500">*</span>
        </label>
        <select
          id="venue_id"
          name="venue_id"
          required
          value={selectedVenueId}
          onChange={(e) => setSelectedVenueId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <option value="">– Venue wählen –</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.type})
            </option>
          ))}
        </select>
      </div>

      {/* Court (optional, shown when venue has courts) */}
      {venueCourts.length > 0 && (
        <div className="space-y-1">
          <label htmlFor="court_id" className="block text-sm font-medium text-gray-700">
            Platz
          </label>
          <select
            id="court_id"
            name="court_id"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="">– Kein spezifischer Platz –</option>
            {venueCourts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Date */}
      <div className="space-y-1">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Datum <span className="text-red-500">*</span>
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      {/* Times */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
            Startzeit (UTC) <span className="text-red-500">*</span>
          </label>
          <input
            id="start_time"
            name="start_time"
            type="time"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
            Endzeit (UTC) <span className="text-red-500">*</span>
          </label>
          <input
            id="end_time"
            name="end_time"
            type="time"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
      </div>

      {/* Status + Price */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            name="status"
            required
            defaultValue="frei"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="frei">Frei</option>
            <option value="belegt">Belegt</option>
            <option value="unbekannt">Unbekannt</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="price_eur" className="block text-sm font-medium text-gray-700">
            Preis (EUR)
          </label>
          <input
            id="price_eur"
            name="price_eur"
            type="number"
            min="0"
            step="0.01"
            placeholder="z.B. 12.00"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending || !selectedVenueId}
        className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Wird gespeichert…' : 'Slot anlegen'}
      </button>

      {/* Feedback */}
      {result?.ok && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
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
