'use client'

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY)')
}

/**
 * Client-side Supabase instance (used by client components).
 *
 * `createBrowserClient` handles token persistence for the browser.
 */
export const supabaseBrowser = createBrowserClient(supabaseUrl, supabaseAnonKey)

