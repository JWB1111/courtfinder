'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { VenueFilter } from '@/types/schemas'
import type { SortOrder } from '@/types/enriched'

const DEFAULTS: VenueFilter = {
  types: [],
  onlyFree: false,
  indoorOnly: false,
  hasTageskarte: false,
  hasProbetraining: false,
  radiusKm: 10,
}

function parseFilter(params: URLSearchParams): VenueFilter {
  const types = params.getAll('type') as VenueFilter['types']
  return {
    types: types.length ? types : [],
    onlyFree: params.get('onlyFree') === '1',
    indoorOnly: params.get('indoorOnly') === '1',
    hasTageskarte: params.get('hasTageskarte') === '1',
    hasProbetraining: params.get('hasProbetraining') === '1',
    radiusKm: Number(params.get('radiusKm') ?? DEFAULTS.radiusKm),
    userLat: params.has('lat') ? Number(params.get('lat')) : undefined,
    userLng: params.has('lng') ? Number(params.get('lng')) : undefined,
    dateFrom: params.get('dateFrom') ?? undefined,
    dateTo: params.get('dateTo') ?? undefined,
  }
}

function filterToParams(filter: Partial<VenueFilter>): URLSearchParams {
  const p = new URLSearchParams()
  filter.types?.forEach((t) => p.append('type', t))
  if (filter.onlyFree) p.set('onlyFree', '1')
  if (filter.indoorOnly) p.set('indoorOnly', '1')
  if (filter.hasTageskarte) p.set('hasTageskarte', '1')
  if (filter.hasProbetraining) p.set('hasProbetraining', '1')
  if (filter.radiusKm && filter.radiusKm !== DEFAULTS.radiusKm)
    p.set('radiusKm', String(filter.radiusKm))
  if (filter.userLat !== undefined) p.set('lat', String(filter.userLat))
  if (filter.userLng !== undefined) p.set('lng', String(filter.userLng))
  if (filter.dateFrom) p.set('dateFrom', filter.dateFrom)
  if (filter.dateTo) p.set('dateTo', filter.dateTo)
  return p
}

export function useVenueFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const filter = parseFilter(params)
  const sort: SortOrder = (params.get('sort') as SortOrder) ?? 'distance'

  const setFilter = useCallback(
    (updates: Partial<VenueFilter>) => {
      const next = filterToParams({ ...filter, ...updates })
      if (sort !== 'distance') next.set('sort', sort)
      router.replace(`?${next.toString()}`, { scroll: false })
    },
    [filter, router, sort]
  )

  const setSort = useCallback(
    (order: SortOrder) => {
      const next = filterToParams(filter)
      if (order !== 'distance') next.set('sort', order)
      router.replace(`?${next.toString()}`, { scroll: false })
    },
    [filter, router]
  )

  const toggleType = useCallback(
    (type: VenueFilter['types'][number]) => {
      const current = filter.types ?? []
      const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type]
      setFilter({ types: next })
    },
    [filter.types, setFilter]
  )

  const resetFilter = useCallback(() => {
    router.replace(pathname, { scroll: false })
  }, [router, pathname])

  return { filter, sort, setFilter, setSort, toggleType, resetFilter }
}
