import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** True only when every key needed for server-side booking is present. Nothing is faked when false. */
export function isBackendConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Service-role client. Server-only (this file cannot be imported into client bundles). Bypasses RLS: authorise before use. */
export function getAdminClient(): SupabaseClient | null {
  if (!isBackendConfigured()) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Anonymous client for public, RLS-protected reads. */
export function getPublicClient(): SupabaseClient | null {
  if (!isBackendConfigured()) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
