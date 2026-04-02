import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY)')
}

/**
 * Request-scoped Supabase client.
 *
 * Notes:
 * - We intentionally keep cookie writes best-effort because Next Server Components
 *   cannot always mutate response headers. Route handlers still work correctly.
 */
export async function createSupabaseServerClient() {
  // In this Next.js setup, `cookies()` is typed as async.
  // We await once so Supabase's cookie helpers always see the resolved store.
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            ;(cookieStore as any).set({ name, value, ...options })
          })
        } catch {
          // Best-effort: if cookie writes aren't allowed, auth calls may fail gracefully.
        }
      },
    },
  })
}

