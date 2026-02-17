import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Suspense } from 'react'
import TimeframeSelector from './TimeframeSelector'

type Timeframe = 'week' | 'month' | 'year'

// Helper to get date range for timeframe
function getDateRange(timeframe: Timeframe) {
  const now = new Date()
  let start: Date
  let end = now

  switch (timeframe) {
    case 'week':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      break
    case 'year':
      start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      break
  }

  return { start: start.toISOString(), end: end.toISOString() }
}

// Word frequency analysis
function analyzeWordFrequency(texts: string[]): { word: string; count: number }[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'my', 'your', 'his', 'her', 'its', 'our', 'their', 'what', 'which', 'who', 'whom', 'whose',
    'where', 'when', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
    'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now'
  ])

  const wordCount: Record<string, number> = {}

  texts.forEach((text) => {
    if (!text) return
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))

    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1
    })
  })

  return Object.entries(wordCount)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

async function getRewindData(timeframe: Timeframe) {
  const { start, end } = getDateRange(timeframe)

  // Get captions with joins for images and profiles (left joins in case some are missing)
  const captionsQuery = supabase
    .from('captions')
    .select(`
      id,
      text,
      created_at,
      image_id,
      profile_id,
      images(url),
      profiles(name, email)
    `)
    .gte('created_at', start)
    .lte('created_at', end)
    .order('created_at', { ascending: false })
    .limit(100)

  // Get caption likes for engagement
  const likesQuery = supabase
    .from('caption_likes')
    .select('caption_id')
    .gte('created_at', start)
    .lte('created_at', end)

  // Get caption votes
  const votesQuery = supabase
    .from('caption_votes')
    .select('caption_id, vote_value')
    .gte('created_at', start)
    .lte('created_at', end)

  // Get humor flavors
  const humorFlavorsQuery = supabase
    .from('humor_flavors')
    .select('id, slug, description')
    .limit(20)

  // Get communities
  const communitiesQuery = supabase
    .from('communities')
    .select('id, name')
    .limit(20)

  // Get caption_examples for word analysis
  const captionExamplesQuery = supabase
    .from('caption_examples')
    .select('caption_text, image_description, text_explanation')
    .limit(500)

  const [
    captionsRes,
    likesRes,
    votesRes,
    humorFlavorsRes,
    communitiesRes,
    captionExamplesRes,
  ] = await Promise.all([
    captionsQuery,
    likesQuery,
    votesQuery,
    humorFlavorsQuery,
    communitiesQuery,
    captionExamplesQuery,
  ])

  // Log errors but don't fail completely
  if (captionsRes.error) {
    console.error('Error fetching captions:', captionsRes.error)
  }
  if (captionExamplesRes?.error) {
    console.error('Error fetching caption_examples:', captionExamplesRes.error)
  }

  // Process data (handle errors gracefully)
  const captions = captionsRes.data || []
  const likes = likesRes.data || []
  const votes = votesRes.data || []
  const humorFlavors = humorFlavorsRes?.data || []
  const communities = communitiesRes?.data || []
  const captionExamples = captionExamplesRes?.data || []

  // Count unique images and profiles
  const uniqueImages = new Set(captions.map((c: any) => c.image_id)).size
  const uniqueProfiles = new Set(captions.map((c: any) => c.profile_id)).size

  // Calculate average vote score
  const voteValues = votes.map((v: any) => v.vote_value || 0)
  const avgLaughScore =
    voteValues.length > 0
      ? voteValues.reduce((a: number, b: number) => a + b, 0) / voteValues.length
      : 0
  const normalizedAvg = Math.max(0, Math.min(5, (avgLaughScore + 5) / 2))

  // Count likes per caption
  const likesByCaption: Record<string, number> = {}
  likes.forEach((like: any) => {
    likesByCaption[like.caption_id] = (likesByCaption[like.caption_id] || 0) + 1
  })

  // Get top captions by likes
  const topCaptions = captions
    .map((caption: any) => ({
      id: caption.id,
      text: caption.text,
      imageUrl: caption.images?.url || null,
      profileName: caption.profiles?.name || caption.profiles?.email || 'Unknown',
      likes: likesByCaption[caption.id] || 0,
    }))
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 6)

  // Word frequency analysis from caption_examples
  const allTexts = captionExamples.flatMap((ex: any) => [
    ex.caption_text,
    ex.image_description,
    ex.text_explanation,
  ]).filter(Boolean)
  const topWords = analyzeWordFrequency(allTexts)

  return {
    totalCaptions: captions.length,
    uniqueImages,
    uniqueProfiles,
    avgLaughScore: normalizedAvg,
    topCaptions,
    topWords,
    humorFlavors: humorFlavors.slice(0, 5),
    communities: communities.slice(0, 5),
    timeframeLabel:
      timeframe === 'week'
        ? 'Last Week'
        : timeframe === 'month'
        ? 'Last Month'
        : 'Last Year',
  }
}


async function RewindContent({ timeframe }: { timeframe: Timeframe }) {
  const data = await getRewindData(timeframe)

  return (
    <>
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-950/90 p-8 sm:p-10">
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
            Caption Volume
          </p>
          <p className="text-5xl font-semibold sm:text-6xl">
            {data.totalCaptions.toLocaleString()}
            <span className="ml-3 text-2xl font-normal text-slate-400">
              captions
            </span>
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
              Unique Images
            </p>
            <p className="text-3xl font-semibold text-sky-300">
              {data.uniqueImages.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
              Unique Profiles
            </p>
            <p className="text-3xl font-semibold text-fuchsia-300">
              {data.uniqueProfiles.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
            Average Engagement Score
          </p>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-semibold text-emerald-300">
              {data.avgLaughScore.toFixed(1)}
            </p>
            <div className="flex-1 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-sky-300 via-sky-400 to-fuchsia-400"
                style={{ width: `${(data.avgLaughScore / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {data.topWords.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 sm:p-10">
          <h2 className="mb-6 text-xl font-semibold text-slate-100">
            Most Common Words
          </h2>
          <div className="flex flex-wrap gap-3">
            {data.topWords.map((item, index) => (
              <div
                key={item.word}
                className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-2"
              >
                <span className="text-sm font-medium text-slate-300">
                  {item.word}
                </span>
                <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-xs font-medium text-sky-300">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.topCaptions.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 sm:p-10">
          <h2 className="mb-6 text-xl font-semibold text-slate-100">
            Top Captions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.topCaptions.map((caption) => (
              <div
                key={caption.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
              >
                {caption.imageUrl && (
                  <div className="mb-3 aspect-[4/3] overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                    <img
                      src={caption.imageUrl}
                      alt={caption.text}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-slate-100">
                  {caption.text}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    by {caption.profileName}
                  </span>
                  <span className="rounded-full bg-sky-500/20 px-2 py-1 text-xs font-medium text-sky-300">
                    ❤️ {caption.likes}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default async function CrackdRewindPage({
  searchParams,
}: {
  searchParams: { timeframe?: string }
}) {
  const timeframe = (searchParams?.timeframe as Timeframe) || 'week'

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-12 sm:px-6 lg:px-10">
        <header className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-sky-200">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              <span>Crackd Rewind</span>
            </div>
            <Link
              href="/data"
              className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-slate-300 transition hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-200"
            >
              View Data
            </Link>
          </div>

          <div className="mb-8 space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Your {timeframe} in{' '}
              <span className="bg-gradient-to-r from-sky-300 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">
                unhinged captions
              </span>
              .
            </h1>
            <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
              A visual mixtape of the captions, communities, and humor flavors
              that defined a random slice of Crackd (I stole this from Spotify Wrapped.).
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Suspense fallback={<div className="h-10 w-32 rounded-full bg-slate-900/60" />}>
              <TimeframeSelector />
            </Suspense>
            <p className="text-sm text-slate-500">
              {timeframe === 'week'
                ? 'Last Week'
                : timeframe === 'month'
                ? 'Last Month'
                : 'Last Year'}
            </p>
          </div>
        </header>

        <Suspense
          fallback={
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-12 text-center">
              <p className="text-slate-400">Loading rewind data...</p>
            </div>
          }>
          <div className="space-y-8">
            <RewindContent timeframe={timeframe} />
          </div>
        </Suspense>
      </div>
    </main>
  )
}
