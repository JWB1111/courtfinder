'use client'

import { useRouter } from 'next/navigation'
import type { TimeOfDay } from '@/lib/availability/aggregator'

const TIMES: { key: TimeOfDay; label: string; sub: string }[] = [
  { key: 'now', label: 'Jetzt', sub: 'Nächste 2 h' },
  { key: 'morning', label: 'Vormittag', sub: '6–12 Uhr' },
  { key: 'afternoon', label: 'Nachmittag', sub: '12–18 Uhr' },
  { key: 'evening', label: 'Abend', sub: '18–24 Uhr' },
  { key: 'today', label: 'Heute', sub: 'Ganzer Tag' },
]

interface Props {
  current: TimeOfDay
  venueId: string
}

export function TimeFilter({ current, venueId }: Props) {
  const router = useRouter()

  return (
    <div className="flex flex-wrap gap-2">
      {TIMES.map(({ key, label, sub }) => {
        const active = current === key
        return (
          <button
            key={key}
            onClick={() => router.replace(`/venue/${venueId}?time=${key}`)}
            className={[
              'flex flex-col items-center rounded-xl px-4 py-2 text-sm transition-colors',
              active
                ? 'bg-ink-900 text-white'
                : 'border border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50',
            ].join(' ')}
          >
            <span className="font-medium">{label}</span>
            <span className={['text-xs', active ? 'text-ink-300' : 'text-ink-400'].join(' ')}>
              {sub}
            </span>
          </button>
        )
      })}
    </div>
  )
}
