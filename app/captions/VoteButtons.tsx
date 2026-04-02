'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VoteButtons({ captionId }: { captionId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<null | 'up' | 'down'>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(voteValue: 1 | -1, which: 'up' | 'down') {
    setLoading(which)
    setError(null)

    const res = await fetch('/api/captions/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ captionId, voteValue }),
    })

    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      setError(payload?.error || 'Failed to submit vote')
      setLoading(null)
      return
    }

    setLoading(null)
    router.refresh()
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => submit(1, 'up')}
          disabled={loading !== null}
          className="flex-1 rounded-full bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-emerald-500/25 disabled:opacity-50"
        >
          {loading === 'up' ? 'Upvoting…' : 'Upvote'}
        </button>
        <button
          type="button"
          onClick={() => submit(-1, 'down')}
          disabled={loading !== null}
          className="flex-1 rounded-full bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-red-500/25 disabled:opacity-50"
        >
          {loading === 'down' ? 'Downvoting…' : 'Downvote'}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-950/20 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      )}
    </div>
  )
}

