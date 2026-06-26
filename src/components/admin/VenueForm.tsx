'use client'

import { useState, useTransition } from 'react'
import { createVenue } from '@/actions/create-venue'
import { geocodeAddress } from '@/actions/geocode'

const FIELD =
  'w-full rounded-lg border border-ink-200 px-3 py-2 text-sm transition-colors hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20'
const LABEL = 'block text-sm font-medium text-ink-700'

export function VenueForm() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ ok: boolean; error?: string; id?: string } | null>(null)

  const [address, setAddress] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [geo, setGeo] = useState<{ loading: boolean; note?: string; error?: string }>({
    loading: false,
  })

  function handleGeocode() {
    setGeo({ loading: true })
    startTransition(async () => {
      const r = await geocodeAddress(address)
      if (r.ok && r.lat != null && r.lng != null) {
        setLat(String(r.lat))
        setLng(String(r.lng))
        setGeo({ loading: false, note: r.displayName })
      } else {
        setGeo({ loading: false, error: r.error ?? 'Keine Koordinaten gefunden.' })
      }
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    startTransition(async () => {
      const r = await createVenue(fd)
      setResult(r)
      if (r.ok) {
        form.reset()
        setAddress('')
        setLat('')
        setLng('')
        setGeo({ loading: false })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1">
        <label htmlFor="name" className={LABEL}>
          Name <span className="text-red-500">*</span>
        </label>
        <input id="name" name="name" required className={FIELD} placeholder="z.B. TC Grün-Weiss Aachen" />
      </div>

      <div className="space-y-1">
        <label htmlFor="type" className={LABEL}>
          Sportart <span className="text-red-500">*</span>
        </label>
        <select id="type" name="type" required defaultValue="tennis" className={FIELD}>
          <option value="tennis">Tennis</option>
          <option value="padel">Padel</option>
          <option value="gym">Gym</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="address" className={LABEL}>
          Adresse <span className="text-red-500">*</span>
        </label>
        <input
          id="address"
          name="address"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={FIELD}
          placeholder="Straße Hausnr., PLZ Ort"
        />
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleGeocode}
            disabled={geo.loading || address.trim().length < 4}
            className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50 disabled:opacity-50"
          >
            {geo.loading ? 'Suche…' : '📍 Koordinaten aus Adresse suchen'}
          </button>
          {geo.note && <span className="text-xs text-emerald-700">✓ {geo.note}</span>}
          {geo.error && <span className="text-xs text-red-600">{geo.error}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="lat" className={LABEL}>
            Breitengrad (lat) <span className="text-red-500">*</span>
          </label>
          <input
            id="lat"
            name="lat"
            required
            inputMode="decimal"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className={`${FIELD} tabular-nums`}
            placeholder="50.7831"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="lng" className={LABEL}>
            Längengrad (lng) <span className="text-red-500">*</span>
          </label>
          <input
            id="lng"
            name="lng"
            required
            inputMode="decimal"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className={`${FIELD} tabular-nums`}
            placeholder="6.1387"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="website" className={LABEL}>
            Website
          </label>
          <input id="website" name="website" className={FIELD} placeholder="https://…" />
        </div>
        <div className="space-y-1">
          <label htmlFor="phone" className={LABEL}>
            Telefon
          </label>
          <input id="phone" name="phone" className={FIELD} placeholder="+49 …" />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
      >
        {isPending ? 'Wird gespeichert…' : 'Venue anlegen'}
      </button>

      {result?.ok && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ✓ Venue gespeichert. Du kannst jetzt Plätze (Tennis/Padel) oder Angebote (Gym) hinzufügen.
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
