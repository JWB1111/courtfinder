'use client'

import type { VenueFilter } from '@/types/schemas'
import type { SortOrder } from '@/types/enriched'

interface Props {
  filter: VenueFilter
  sort: SortOrder
  onToggleType: (type: VenueFilter['types'][number]) => void
  onSetFilter: (updates: Partial<VenueFilter>) => void
  onSetSort: (order: SortOrder) => void
  onReset: () => void
}

const TYPES: Array<{ value: VenueFilter['types'][number]; label: string; active: string }> = [
  { value: 'tennis', label: 'Tennis', active: 'bg-brand-600 text-white border-brand-600' },
  { value: 'padel', label: 'Padel', active: 'bg-sky-600 text-white border-sky-600' },
  { value: 'gym', label: 'Gym', active: 'bg-violet-600 text-white border-violet-600' },
]

const RADII: number[] = [2, 5, 10, 20, 50]

const SORT_OPTIONS: Array<{ value: SortOrder; label: string }> = [
  { value: 'distance', label: 'Entfernung' },
  { value: 'free_slots', label: 'Freie Plätze' },
  { value: 'name', label: 'Name' },
]

const SELECT_CLASS =
  'rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm text-ink-700 transition-colors hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20'

export function FilterBar({ filter, sort, onToggleType, onSetFilter, onSetSort, onReset }: Props) {
  const showGym = filter.types.length === 0 || filter.types.includes('gym')
  const showCourt = filter.types.length === 0 || filter.types.some((t) => t !== 'gym')

  return (
    <div className="space-y-4 rounded-2xl border border-ink-200 bg-white p-4 shadow-sm sm:p-5">
      {/* Sport type */}
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-ink-400 uppercase">Sportart</p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => {
            const active = filter.types.includes(t.value)
            return (
              <button
                key={t.value}
                onClick={() => onToggleType(t.value)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  active
                    ? t.active
                    : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Quick toggles */}
      <div className="flex flex-wrap gap-2">
        {showCourt && (
          <>
            <Toggle
              label="Nur freie Plätze"
              active={filter.onlyFree}
              onChange={(v) => onSetFilter({ onlyFree: v })}
              activeClass="border-brand-600 bg-brand-600 text-white"
            />
            <Toggle
              label="Hallenplatz"
              active={filter.indoorOnly}
              onChange={(v) => onSetFilter({ indoorOnly: v })}
            />
          </>
        )}
        {showGym && (
          <>
            <Toggle
              label="Tageskarte"
              active={filter.hasTageskarte}
              onChange={(v) => onSetFilter({ hasTageskarte: v })}
              activeClass="border-orange-500 bg-orange-500 text-white"
            />
            <Toggle
              label="Probetraining"
              active={filter.hasProbetraining}
              onChange={(v) => onSetFilter({ hasProbetraining: v })}
              activeClass="border-teal-600 bg-teal-600 text-white"
            />
          </>
        )}
      </div>

      {/* Radius + Sort + Reset */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-ink-100 pt-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold tracking-wide text-ink-400 uppercase">
            Umkreis
          </label>
          <select
            value={filter.radiusKm}
            onChange={(e) => onSetFilter({ radiusKm: Number(e.target.value) })}
            className={SELECT_CLASS}
          >
            {RADII.map((r) => (
              <option key={r} value={r}>
                {r} km
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold tracking-wide text-ink-400 uppercase">
            Sortierung
          </label>
          <select
            value={sort}
            onChange={(e) => onSetSort(e.target.value as SortOrder)}
            className={SELECT_CLASS}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onReset}
          className="ml-auto text-sm font-medium text-ink-400 underline-offset-2 transition-colors hover:text-ink-600 hover:underline"
        >
          Zurücksetzen
        </button>
      </div>
    </div>
  )
}

function Toggle({
  label,
  active,
  onChange,
  activeClass = 'border-ink-900 bg-ink-900 text-white',
}: {
  label: string
  active: boolean
  onChange: (v: boolean) => void
  activeClass?: string
}) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
        active ? activeClass : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50'
      }`}
    >
      {label}
    </button>
  )
}
