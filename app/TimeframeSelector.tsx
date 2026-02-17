'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Timeframe = 'week' | 'month' | 'year'

export default function TimeframeSelector() {
  const searchParams = useSearchParams()
  const currentTimeframe = (searchParams?.get('timeframe') as Timeframe) || 'week'

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/60 p-1">
      {(['week', 'month', 'year'] as Timeframe[]).map((option) => {
        const active = currentTimeframe === option
        const label =
          option === 'week'
            ? 'Week'
            : option === 'month'
            ? 'Month'
            : 'Year'
        return (
          <Link
            key={option}
            href={`?timeframe=${option}`}
            className={`rounded-full px-4 py-2 text-sm font-medium uppercase tracking-[0.1em] transition ${
              active
                ? 'bg-sky-400 text-slate-950 shadow-sm shadow-sky-500/40'
                : 'text-slate-300 hover:text-sky-100'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}

