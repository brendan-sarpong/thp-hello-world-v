import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type CookieStoreWithSet = {
  set: (cookie: { name: string; value: string } & Record<string, unknown>) => void
}

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
 
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            ;(cookieStore as unknown as CookieStoreWithSet).set({
              name,
              value,
              ...options,
            })
          })
        } catch {
          // Best-effort: if cookie writes aren't allowed, auth calls may fail gracefully.
        }
      },
    },
  })
}

