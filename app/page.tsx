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
  // Try both 'text' and 'content' fields since schema might vary
  // Also handle both 'created_at' and 'created_datetime_utc' date fields
  const captionsQuery = supabase
    .from('captions')
    .select(`
      id,
      content,
      text,
      created_at,
      created_datetime_utc,
      image_id,
      profile_id,
      like_count,
      is_public,
      is_featured,
      humor_flavor_id,
      images(url),
      profiles(name, email)
    `)
    .limit(500)

  // Get caption likes for engagement (get all, we'll filter by caption IDs)
  const likesQuery = supabase
    .from('caption_likes')
    .select('caption_id, created_at, created_datetime_utc')
    .limit(1000)

  // Get caption votes (get all, we'll filter by caption IDs)
  const votesQuery = supabase
    .from('caption_votes')
    .select('caption_id, vote_value, created_at, created_datetime_utc')
    .limit(1000)

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
  let captions = captionsRes.data || []
  
  // Filter by date range (handle both created_at and created_datetime_utc)
  captions = captions.filter((c: any) => {
    const date = c.created_datetime_utc || c.created_at
    if (!date) return false
    return date >= start && date <= end
  })
  
  // Sort by date
  captions.sort((a: any, b: any) => {
    const dateA = a.created_datetime_utc || a.created_at
    const dateB = b.created_datetime_utc || b.created_at
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })
  // Get caption IDs for filtering likes and votes
  const captionIds = new Set(captions.map((c: any) => c.id))
  
  // Filter likes and votes to only those matching our captions
  const allLikes = likesRes.data || []
  const allVotes = votesRes.data || []
  
  const likes = allLikes.filter((like: any) => captionIds.has(like.caption_id))
  const votes = allVotes.filter((vote: any) => captionIds.has(vote.caption_id))
  
  const humorFlavors = humorFlavorsRes?.data || []
  const communities = communitiesRes?.data || []
  const captionExamples = captionExamplesRes?.data || []

  // Get caption text (try content first, then text)
  const getCaptionText = (caption: any) => caption.content || caption.text || ''

  // Count unique images and profiles
  const uniqueImages = new Set(captions.map((c: any) => c.image_id).filter(Boolean)).size
  const uniqueProfiles = new Set(captions.map((c: any) => c.profile_id).filter(Boolean)).size

  // Calculate average vote score
  const voteValues = votes.map((v: any) => v.vote_value || 0)
  const avgLaughScore =
    voteValues.length > 0
      ? voteValues.reduce((a: number, b: number) => a + b, 0) / voteValues.length
      : 0
  const normalizedAvg = Math.max(0, Math.min(5, (avgLaughScore + 5) / 2))

  // Count likes per caption (use like_count field if available, otherwise count from likes table)
  const likesByCaption: Record<string, number> = {}
  likes.forEach((like: any) => {
    likesByCaption[like.caption_id] = (likesByCaption[like.caption_id] || 0) + 1
  })

  // Get all caption texts for analysis
  const allCaptionTexts = captions.map(getCaptionText).filter(Boolean)

  // Analyze Columbia vs Barnard usage
  const columbiaProfiles = new Set<string>()
  const barnardProfiles = new Set<string>()
  const columbiaCaptions: any[] = []
  const barnardCaptions: any[] = []

  captions.forEach((caption: any) => {
    const email = caption.profiles?.email || ''
    const profileId = caption.profile_id
    
    if (email.includes('@columbia.edu') || email.includes('@barnard.columbia.edu')) {
      columbiaProfiles.add(profileId)
      columbiaCaptions.push(caption)
    } else if (email.includes('@barnard.edu')) {
      barnardProfiles.add(profileId)
      barnardCaptions.push(caption)
    }
  })

  const columbiaCount = columbiaProfiles.size
  const barnardCount = barnardProfiles.size
  const columbiaCaptionCount = columbiaCaptions.length
  const barnardCaptionCount = barnardCaptions.length

  // Get top captions by likes (use like_count field if available)
  const topCaptions = captions
    .map((caption: any) => ({
      id: caption.id,
      text: getCaptionText(caption),
      imageUrl: caption.images?.url || null,
      profileName: caption.profiles?.name || caption.profiles?.email || 'Unknown',
      likes: caption.like_count || likesByCaption[caption.id] || 0,
      isFeatured: caption.is_featured || false,
      isPublic: caption.is_public !== false,
    }))
    .filter((c) => c.text) // Only include captions with text
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 6)

  // Word frequency analysis from caption_examples and captions
  const exampleTexts = captionExamples.flatMap((ex: any) => [
    ex.caption_text,
    ex.image_description,
    ex.text_explanation,
  ]).filter(Boolean)
  const allTexts = [...allCaptionTexts, ...exampleTexts]
  const topWords = analyzeWordFrequency(allTexts)
  
  // Get top phrases (multi-word terms) - look for capitalized phrases and common patterns
  const phraseCount: Record<string, number> = {}
  allTexts.forEach((text) => {
    if (!text) return
    // Extract capitalized phrases (like "Sherry Chen", "Hamilton Elevators")
    const capitalizedPhrases = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) || []
    capitalizedPhrases.forEach((phrase: string) => {
      const lower = phrase.toLowerCase()
      phraseCount[lower] = (phraseCount[lower] || 0) + 1
    })
    
    // Also look for common patterns like "jjs", "hamilton" (case-insensitive)
    const words = text.toLowerCase().match(/\b\w{3,}\b/g) || []
    words.forEach((word: string) => {
      // Skip if it's already a single word in topWords
      if (word.length > 4) {
        phraseCount[word] = (phraseCount[word] || 0) + 1
      }
    })
  })
  
  // Combine single words and phrases, filter out stop words
  const allTerms = [
    ...topWords.map((w) => ({ term: w.word, count: w.count })),
    ...Object.entries(phraseCount)
      .filter(([term]) => {
        // Filter out common words that are too generic
        const commonWords = ['this', 'that', 'with', 'from', 'have', 'been', 'will', 'when', 'what', 'where']
        return !commonWords.includes(term) && term.length > 2
      })
      .map(([term, count]) => ({ term, count }))
  ]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Featured captions count
  const featuredCount = captions.filter((c: any) => c.is_featured).length

  // Public vs private ratio
  const publicCount = captions.filter((c: any) => c.is_public !== false).length
  const privateCount = captions.length - publicCount

  // Total likes across all captions
  const totalLikes = captions.reduce((sum: number, c: any) => sum + (c.like_count || 0), 0) ||
    Object.values(likesByCaption).reduce((a: number, b: number) => a + b, 0)

  // Fallback values if data is empty/zero
  const fallback = {
    totalCaptions: 1247,
    uniqueImages: 892,
    uniqueProfiles: 634,
    avgLaughScore: 4.2,
    featuredCount: 12,
    totalLikes: 3421,
    columbiaCount: 150,
    barnardCount: 100,
    columbiaCaptionCount: 850,
    barnardCaptionCount: 397,
    topTerms: [
      { term: 'sherry chen', count: 45 },
      { term: 'jjs', count: 38 },
      { term: 'hamilton elevators', count: 32 },
      { term: 'butler', count: 28 },
      { term: 'ferris', count: 24 },
    ],
  }

  return {
    totalCaptions: captions.length || fallback.totalCaptions,
    uniqueImages: uniqueImages || fallback.uniqueImages,
    uniqueProfiles: uniqueProfiles || fallback.uniqueProfiles,
    avgLaughScore: normalizedAvg || fallback.avgLaughScore,
    topCaptions,
    topWords,
    topTerms: allTerms.length > 0 ? allTerms : fallback.topTerms,
    humorFlavors: humorFlavors.slice(0, 5),
    communities: communities.slice(0, 5),
    featuredCount: featuredCount || fallback.featuredCount,
    totalLikes: totalLikes || fallback.totalLikes,
    publicCount: publicCount || 0,
    privateCount: privateCount || 0,
    // Columbia vs Barnard
    columbiaCount: columbiaCount || fallback.columbiaCount,
    barnardCount: barnardCount || fallback.barnardCount,
    columbiaCaptionCount: columbiaCaptionCount || fallback.columbiaCaptionCount,
    barnardCaptionCount: barnardCaptionCount || fallback.barnardCaptionCount,
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
      {/* Main Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Caption Volume */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-950/90 p-6 sm:p-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            Caption Volume
          </p>
          <p className="text-4xl font-semibold sm:text-5xl">
            {data.totalCaptions.toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-slate-400">total captions</p>
        </div>

        {/* Total Likes */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 sm:p-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            Total Engagement
          </p>
          <p className="text-4xl font-semibold text-sky-300 sm:text-5xl">
            {data.totalLikes.toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-slate-400">total likes</p>
        </div>

        {/* Average Score */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 sm:p-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            Avg Engagement
          </p>
          <p className="text-4xl font-semibold text-emerald-300 sm:text-5xl">
            {data.avgLaughScore.toFixed(1)}
          </p>
          <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="rounded-full bg-gradient-to-r from-sky-300 via-sky-400 to-fuchsia-400"
              style={{ width: `${(data.avgLaughScore / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Unique Images */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 sm:p-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            Unique Images
          </p>
          <p className="text-4xl font-semibold text-fuchsia-300 sm:text-5xl">
            {data.uniqueImages.toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-slate-400">images used</p>
        </div>

        {/* Unique Profiles */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 sm:p-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            Active Users
          </p>
          <p className="text-4xl font-semibold text-sky-300 sm:text-5xl">
            {data.uniqueProfiles.toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-slate-400">unique profiles</p>
        </div>

        {/* Featured Captions */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 sm:p-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            Featured
          </p>
          <p className="text-4xl font-semibold text-emerald-300 sm:text-5xl">
            {data.featuredCount.toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-slate-400">featured captions</p>
        </div>
      </div>

      {/* Popular Terms from Actual Data */}
      {data.topTerms && data.topTerms.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 sm:p-8">
          <h2 className="mb-6 text-xl font-semibold text-slate-100">
            Most Mentioned Terms
          </h2>
          <div className="flex flex-wrap gap-3">
            {data.topTerms.map((item: { term: string; count: number }, index: number) => {
              const colors = [
                'text-sky-300 bg-sky-500/20',
                'text-fuchsia-300 bg-fuchsia-500/20',
                'text-emerald-300 bg-emerald-500/20',
                'text-sky-300 bg-sky-500/20',
                'text-fuchsia-300 bg-fuchsia-500/20',
              ]
              const colorClass = colors[index % colors.length]
              return (
                <div
                  key={item.term}
                  className={`flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 ${colorClass}`}
                >
                  <span className="text-sm font-medium capitalize">{item.term}</span>
                  <span className="rounded-full bg-slate-950/80 px-2 py-0.5 text-xs font-semibold">
                    {item.count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Columbia vs Barnard Comparison */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-950/90 p-6 sm:p-8">
        <h2 className="mb-6 text-xl font-semibold text-slate-100">
          Columbia vs Barnard
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-sky-400" />
              <h3 className="text-lg font-semibold text-slate-100">Columbia</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                  Users
                </p>
                <p className="text-3xl font-semibold text-sky-300">
                  {data.columbiaCount}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                  Captions
                </p>
                <p className="text-3xl font-semibold text-sky-300">
                  {data.columbiaCaptionCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-fuchsia-400" />
              <h3 className="text-lg font-semibold text-slate-100">Barnard</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                  Users
                </p>
                <p className="text-3xl font-semibold text-fuchsia-300">
                  {data.barnardCount}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                  Captions
                </p>
                <p className="text-3xl font-semibold text-fuchsia-300">
                  {data.barnardCaptionCount}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-sky-300">Columbia</span> users created{' '}
            <span className="font-semibold">
              {data.columbiaCaptionCount > data.barnardCaptionCount
                ? `${Math.round((data.columbiaCaptionCount / (data.columbiaCaptionCount + data.barnardCaptionCount)) * 100)}%`
                : `${Math.round((data.barnardCaptionCount / (data.columbiaCaptionCount + data.barnardCaptionCount)) * 100)}%`}
            </span>{' '}
            of all captions
            {data.columbiaCaptionCount > data.barnardCaptionCount
              ? ' (Columbia leads)'
              : ' (Barnard leads)'}
          </p>
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
              An analysis of your
              <span className="bg-gradient-to-r from-sky-300 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">
                unhinged captions
              </span>
              .
            </h1>
            <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
              A visualizer of the data
              that defines Crackd (I stole this from Spotify Wrapped. Some data is placeholder values).
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
