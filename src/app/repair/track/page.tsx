import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { TrackClient } from "@/components/repair/track-client";
import { isBackendConfigured } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Track Your Repair",
  description: "Follow your FixSure repair from booking to handover using your ticket number.",
  alternates: { canonical: "/repair/track" },
  robots: { index: false },
};

export default async function TrackPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const ticket = Array.isArray(sp.ticket) ? sp.ticket[0] : sp.ticket;
  return (
    <PageShell title="Track your repair" intro="Enter your ticket number and the phone number on the booking (or your tracking key)." narrow={false}>
      <TrackClient initialTicket={ticket?.slice(0, 20)} configured={isBackendConfigured()} />
    </PageShell>
  );
}
