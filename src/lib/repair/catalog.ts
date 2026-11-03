import "server-only";
import { getPublicClient, isBackendConfigured } from "@/lib/supabase/admin";
import { rupeesToPaise } from "@/lib/money";

export type RepairServiceItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: "common" | "advanced";
  iconKey: string;
  startingPricePaise: number | null; // null => "quote after diagnosis"
  diagnosticFeePaise: number | null;
  durationText: string | null; // only when configured
  doorstepAvailable: boolean;
};

export type Slot = { id: string; startsAt: string; endsAt: string; fulfilment: "doorstep" | "pickup" | "store_dropoff"; remaining: number };

export type RepairCatalog = {
  /** false => sample mode: nothing can be booked online and nothing is advertised as available. */
  configured: boolean;
  brands: { name: string; models: string[] }[];
  services: RepairServiceItem[];
  slots: Slot[];
  /** Service-centre drop-off locations. Empty => the option is shown as not configured. */
  centres: { id: string; name: string; address: string; city: string }[];
};

/** Mobile repair offering templates. In sample mode they are shown without prices/durations. */
export const SERVICE_TEMPLATES: Omit<RepairServiceItem, "id" | "startingPricePaise" | "diagnosticFeePaise" | "durationText" | "doorstepAvailable">[] = [
  { slug: "screen-replacement", name: "Screen replacement", category: "common", iconKey: "screen", description: "Cracked glass, dead touch, lines or a dark display." },
  { slug: "battery-replacement", name: "Battery replacement", category: "common", iconKey: "battery", description: "Fast draining, swollen or shutting down at random." },
  { slug: "charging-port-repair", name: "Charging port repair", category: "common", iconKey: "port", description: "Loose, dirty or not charging reliably." },
  { slug: "back-glass-replacement", name: "Back glass replacement", category: "common", iconKey: "back", description: "Cracked or shattered rear panel." },
  { slug: "software-troubleshooting", name: "Software troubleshooting", category: "common", iconKey: "software", description: "Hangs, boot loops, storage and update problems." },
  { slug: "camera-repair", name: "Camera repair", category: "advanced", iconKey: "camera", description: "Blurry, black or cracked camera modules." },
  { slug: "speaker-mic-repair", name: "Speaker & microphone repair", category: "advanced", iconKey: "speaker", description: "Muffled calls, no sound or crackling audio." },
  { slug: "water-damage-diagnosis", name: "Water damage diagnosis", category: "advanced", iconKey: "water", description: "Assessment after liquid exposure. Do not charge the phone." },
  { slug: "power-motherboard", name: "Power & motherboard issues", category: "advanced", iconKey: "board", description: "Won’t switch on, no display or short-circuit symptoms." },
  { slug: "other-hardware", name: "Other hardware repairs", category: "advanced", iconKey: "wrench", description: "Buttons, vibration motor, sensors and anything else." },
];

/** Sample mode only: brand list requested by the owner; models are real public product names, support is NOT implied. */
const SAMPLE_BRANDS: RepairCatalog["brands"] = [
  { name: "Apple iPhone", models: ["iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15"] },
  { name: "Samsung", models: ["Galaxy A14", "Galaxy A34", "Galaxy M14", "Galaxy S23"] },
  { name: "OnePlus", models: ["OnePlus Nord CE 3", "OnePlus 11", "OnePlus 12R"] },
  { name: "Google Pixel", models: ["Pixel 6a", "Pixel 7", "Pixel 8"] },
  { name: "Xiaomi / Redmi", models: ["Redmi Note 12", "Redmi 12", "Xiaomi 13"] },
  { name: "Vivo", models: ["Vivo V29", "Vivo Y27", "Vivo T2"] },
  { name: "Oppo", models: ["Oppo Reno 10", "Oppo A78", "Oppo F23"] },
  { name: "Realme", models: ["Realme 11", "Realme Narzo 60", "Realme C55"] },
];

function sampleCatalog(): RepairCatalog {
  return {
    configured: false,
    brands: SAMPLE_BRANDS,
    services: SERVICE_TEMPLATES.map((s) => ({ ...s, id: s.slug, startingPricePaise: null, diagnosticFeePaise: null, durationText: null, doorstepAvailable: false })),
    slots: [],
    centres: [],
  };
}

type ServiceRow = { id: string; slug: string; name: string; description: string | null; category: "common" | "advanced"; icon_key: string | null;
  starting_price: string | null; diagnostic_fee: string | null; est_duration_text: string | null; doorstep_available: boolean };

/** Real data when Supabase is configured; otherwise the clearly-flagged sample catalogue. */
export async function loadRepairCatalog(): Promise<RepairCatalog> {
  const db = getPublicClient();
  if (!db || !isBackendConfigured()) return sampleCatalog();

  const [models, services, slots, centres] = await Promise.all([
    db.from("device_models").select("manufacturer, series, model").eq("device_type", "mobile").eq("active", true).order("manufacturer").order("model"),
    db.from("repair_services").select("id, slug, name, description, category, icon_key, starting_price, diagnostic_fee, est_duration_text, doorstep_available")
      .eq("device_type", "mobile").eq("active", true).order("sort_order"),
    db.from("repair_slots").select("id, starts_at, ends_at, fulfilment, capacity, booked").order("starts_at").limit(60),
    db.from("repair_locations").select("id, name, address, city").eq("kind", "store_dropoff").eq("active", true),
  ]);
  if (models.error || services.error || slots.error || centres.error) {
    console.error("repair catalogue load failed", models.error?.code, services.error?.code, slots.error?.code);
    return { configured: true, brands: [], services: [], slots: [], centres: [] };
  }

  const byBrand = new Map<string, string[]>();
  for (const m of models.data ?? []) {
    const label = [m.series, m.model].filter(Boolean).join(" ").trim() || m.model;
    byBrand.set(m.manufacturer, [...(byBrand.get(m.manufacturer) ?? []), label]);
  }
  return {
    configured: true,
    brands: [...byBrand].map(([name, ms]) => ({ name, models: ms })),
    services: ((services.data ?? []) as ServiceRow[]).map((s) => ({
      id: s.id, slug: s.slug, name: s.name, description: s.description ?? "", category: s.category, iconKey: s.icon_key ?? "wrench",
      startingPricePaise: s.starting_price != null ? rupeesToPaise(s.starting_price) : null,
      diagnosticFeePaise: s.diagnostic_fee != null && Number(s.diagnostic_fee) > 0 ? rupeesToPaise(s.diagnostic_fee) : null,
      durationText: s.est_duration_text, doorstepAvailable: s.doorstep_available,
    })),
    slots: (slots.data ?? []).map((s) => ({ id: s.id, startsAt: s.starts_at, endsAt: s.ends_at, fulfilment: s.fulfilment, remaining: s.capacity - s.booked })),
    centres: centres.data ?? [],
  };
}
