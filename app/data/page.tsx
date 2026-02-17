import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default async function DataPage() {
  const [
    profilesRes,
    captionsRes,
    captionLikesRes,
    captionVotesRes,
    humorFlavorsRes,
    communitiesRes,
    imagesRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*').limit(10),
    supabase.from('captions').select('*').limit(10),
    supabase.from('caption_likes').select('*').limit(10),
    supabase.from('caption_votes').select('*').limit(10),
    supabase.from('humor_flavors').select('*').limit(10),
    supabase.from('communities').select('*').limit(10),
    supabase.from('images').select('*').limit(10),
  ])

  const errors = [
    profilesRes.error,
    captionsRes.error,
    captionLikesRes.error,
    captionVotesRes.error,
    humorFlavorsRes.error,
    communitiesRes.error,
    imagesRes.error,
  ].filter(Boolean)

  if (errors.length > 0) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
          <div className="rounded-3xl border border-red-500/40 bg-red-950/20 p-6">
            <h1 className="mb-2 text-xl font-semibold text-red-300">
              Error loading data
            </h1>
            <pre className="overflow-auto text-sm text-red-200">
              {JSON.stringify(errors, null, 2)}
            </pre>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
        <header className="mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-sky-200">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              <span>Crackd Data Explorer</span>
            </div>
            <Link
              href="/"
              className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-slate-300 transition hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-200"
            >
              Back to Rewind
            </Link>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Supabase Tables
          </h1>
          <p className="max-w-xl text-sm text-slate-300 sm:text-base">
            Read-only view of Crackd&apos;s core domain model: profiles, images,
            captions, communities, and more.
          </p>
        </header>

        <div className="space-y-8">
          <Section
            title="Profiles"
            data={profilesRes.data || []}
            description="User profiles from the Crackd platform"
          />
          <Section
            title="Captions"
            data={captionsRes.data || []}
            description="Generated captions with humor flavors and lineage"
          />
          <Section
            title="Caption Likes"
            data={captionLikesRes.data || []}
            description="Like interactions from almostcrackd.ai"
          />
          <Section
            title="Caption Votes"
            data={captionVotesRes.data || []}
            description="Up/down votes from slightlyhumorous.org"
          />
          <Section
            title="Humor Flavors"
            data={humorFlavorsRes.data || []}
            description="Named generation strategies from The Matrix"
          />
          <Section
            title="Communities"
            data={communitiesRes.data || []}
            description="Bounded social groups with cultural context"
          />
          <Section
            title="Images"
            data={imagesRes.data || []}
            description="Hosted visual assets with cached AI metadata"
          />
        </div>
      </div>
    </main>
  )
}

function Section({
  title,
  data,
  description,
}: {
  title: string
  data: any[]
  description?: string
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-slate-400">{description}</p>
            )}
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-slate-400">
            {data.length} records
          </span>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center">
          <p className="text-sm text-slate-500">No data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          )}
        </div>
        <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-medium text-sky-300">
          {data.length} records
        </span>
      </div>

      <div className="space-y-3">
        {data.map((item, index) => (
          <div
            key={item.id || index}
            className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700 hover:bg-slate-900/80"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  {item.id && (
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                      ID: {item.id}
                    </p>
                  )}
                  {item.name && (
                    <p className="text-sm font-semibold text-slate-100">
                      {item.name}
                    </p>
                  )}
                  {item.text && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-slate-200">
                      {item.text}
                    </p>
                  )}
                  {item.email && (
                    <p className="text-xs text-slate-300">{item.email}</p>
                  )}
                  {item.slug && (
                    <p className="text-xs text-slate-300">
                      <span className="text-slate-400">Slug:</span> {item.slug}
                    </p>
                  )}
                  {item.description && (
                    <p className="line-clamp-2 text-xs text-slate-300">
                      {item.description}
                    </p>
                  )}
                </div>
                {item.url && (
                  <div className="flex-shrink-0">
                    <div className="aspect-square h-16 overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                      <img
                        src={item.url}
                        alt={item.name || item.text || 'Image'}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {item.created_at && (
                  <span className="rounded-full bg-slate-950/80 px-2 py-0.5 text-slate-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                )}
                {item.updated_at && (
                  <span className="rounded-full bg-slate-950/80 px-2 py-0.5 text-slate-400">
                    Updated: {new Date(item.updated_at).toLocaleDateString()}
                  </span>
                )}
                {item.is_public !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      item.is_public
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.is_public ? 'Public' : 'Private'}
                  </span>
                )}
                {item.is_enabled !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      item.is_enabled
                        ? 'bg-sky-500/20 text-sky-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.is_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                )}
                {item.profile_id && (
                  <span className="rounded-full bg-slate-950/80 px-2 py-0.5 text-slate-400">
                    Profile: {item.profile_id}
                  </span>
                )}
                {item.caption_id && (
                  <span className="rounded-full bg-slate-950/80 px-2 py-0.5 text-slate-400">
                    Caption: {item.caption_id}
                  </span>
                )}
                {item.image_id && (
                  <span className="rounded-full bg-slate-950/80 px-2 py-0.5 text-slate-400">
                    Image: {item.image_id}
                  </span>
                )}
                {item.vote_value !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      item.vote_value > 0
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : item.vote_value < 0
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Vote: {item.vote_value > 0 ? '+' : ''}
                    {item.vote_value}
                  </span>
                )}
              </div>

              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-200">
                  View full JSON
                </summary>
                <pre className="mt-2 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-[0.7rem] text-slate-300">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

