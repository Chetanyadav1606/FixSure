import { SampleCatalogRepository } from "./sample-repo";
import type { CatalogRepository } from "./types";

/**
 * Phase 3 uses the sample repository. Phase 5 adds SupabaseCatalogRepository (same interface) and
 * this factory switches on NEXT_PUBLIC_SUPABASE_URL being configured.
 */
export function getCatalog(): CatalogRepository {
  return new SampleCatalogRepository();
}

export * from "./types";
