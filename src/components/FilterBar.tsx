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

const TYPES: Array<{ value: VenueFilter['types'][number]; label: string }> = [
  { value: 'tennis', label: 'Tennis' },
  { value: 'padel', label: 'Padel' },
  { value: 'gym', label: 'Gym' },
]

const RADII: number[] = [2, 5, 10, 20, 50]

const SORT_OPTIONS: Array<{ value: SortOrder; label: string }> = [
  { value: 'distance', label: 'Entfernung' },
  { value: 'free_slots', label: 'Freie Plätze' },
  { value: 'name', label: 'Name' },
]

export function FilterBar({ filter, sort, onToggleType, onSetFilter, onSetSort, onReset }: Props) {
  const showGym = filter.types.length === 0 || filter.types.includes('gym')
  const showCourt = filter.types.length === 0 || filter.types.some((t) => t !== 'gym')

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Sport type */}
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">Sportart</p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => {
            const active = filter.types.includes(t.value)
            return (
              <button
                key={t.value}
                onClick={() => onToggleType(t.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  active
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
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
              activeClass="bg-green-600 text-white"
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
              activeClass="bg-orange-500 text-white"
            />
            <Toggle
              label="Probetraining"
              active={filter.hasProbetraining}
              onChange={(v) => onSetFilter({ hasProbetraining: v })}
              activeClass="bg-teal-600 text-white"
            />
          </>
        )}
      </div>

      {/* Radius + Sort */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Umkreis
          </label>
          <select
            value={filter.radiusKm}
            onChange={(e) => onSetFilter({ radiusKm: Number(e.target.value) })}
            className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
          >
            {RADII.map((r) => (
              <option key={r} value={r}>
                {r} km
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Sortierung
          </label>
          <select
            value={sort}
            onChange={(e) => onSetSort(e.target.value as SortOrder)}
            className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
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
          className="ml-auto text-sm text-gray-400 underline-offset-2 hover:text-gray-600 hover:underline"
        >
          Filter zurücksetzen
        </button>
      </div>
    </div>
  )
}

function Toggle({
  label,
  active,
  onChange,
  activeClass = 'bg-gray-900 text-white',
}: {
  label: string
  active: boolean
  onChange: (v: boolean) => void
  activeClass?: string
}) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active ? activeClass : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )
}
