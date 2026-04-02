/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import VoteButtons from './VoteButtons'
import ImageUploadAndGenerate from './ImageUploadAndGenerate'

function getCaptionText(caption: any) {
  return caption.content ?? caption.text ?? ''
}

function getCaptionDate(caption: any) {
  const value = caption.created_datetime_utc ?? caption.created_at
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export default async function CaptionsPage() {
  const supabase = await createSupabaseServerClient()

  // Auth gate (Task 3)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  // Task 2: read from a pre-existing Supabase table and render a list.
  const { data: captions, error } = await supabase
    .from('captions')
    .select(
      'id, content, text, created_at, created_datetime_utc, image_id, profile_id, humor_flavor_id, is_featured, is_public, like_count',
    )
    .limit(50)

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div className="rounded-3xl border border-red-500/30 bg-red-950/20 p-6">
            <h1 className="text-2xl font-semibold text-red-200">
              Error loading captions
            </h1>
            <pre className="mt-3 overflow-auto text-sm text-red-200">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
          <div className="mt-6">
            <Link
              href="/"
              className="text-slate-300 underline underline-offset-4 hover:text-slate-100"
            >
              Back home
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <header>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Captions
            </h1>
            <p className="mt-2 text-slate-300">
              Authenticated view. Next tasks add voting and image-caption
              generation.
            </p>
          </header>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-100"
            >
              Home
            </Link>
            <Link
              href="/data"
              className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-100"
            >
              Data Explorer
            </Link>
          </div>
        </div>

        <ImageUploadAndGenerate />

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {(captions ?? []).map((caption: any) => {
            const text = getCaptionText(caption)
            const date = getCaptionDate(caption)
            return (
              <article
                key={caption.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-4 text-sm leading-relaxed text-slate-100">
                      {text || '(no caption text)'}
                    </p>
                  </div>
                  {caption.is_featured && (
                    <span className="shrink-0 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300">
                      Featured
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  {date && (
                    <span className="rounded-full bg-slate-950/60 px-2 py-1">
                      {date.toLocaleDateString()}
                    </span>
                  )}
                  {caption.is_public !== undefined && (
                    <span className="rounded-full bg-slate-950/60 px-2 py-1">
                      {caption.is_public ? 'Public' : 'Private'}
                    </span>
                  )}
                  {typeof caption.like_count === 'number' && (
                    <span className="rounded-full bg-sky-500/15 px-2 py-1 text-sky-300">
                      ❤️ {caption.like_count}
                    </span>
                  )}
                </div>

                <VoteButtons captionId={String(caption.id)} />
              </article>
            )
          })}
        </div>
      </div>
    </main>
  )
}

