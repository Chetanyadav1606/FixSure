"use client";

import { useActionState } from "react";
import { Check, Circle, Loader2 } from "lucide-react";
import { decideQuote, trackRepair, type TrackState, type TrackedRepair } from "@/app/repair/actions";
import { formatINR, rupeesToPaise } from "@/lib/money";
import { cn } from "@/lib/utils";

const LABEL: Record<string, string> = {
  requested: "Booking received", confirmed: "Booking confirmed", device_received: "Device received", diagnosing: "Diagnosing",
  quote_pending: "Quotation pending", approved: "Quotation approved", repairing: "Repair in progress", quality_check: "Quality check",
  ready: "Ready for handover", completed: "Completed", cancelled: "Cancelled", declined: "Quotation declined",
};
const FLOW = ["requested", "confirmed", "device_received", "diagnosing", "quote_pending", "approved", "repairing", "quality_check", "ready", "completed"];
const fmt = (iso: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date(iso));
const money = (n: number) => formatINR(rupeesToPaise(n));
const input = "h-12 w-full rounded-lg border border-line bg-surface px-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

function Timeline({ repair }: { repair: TrackedRepair }) {
  const done = new Map(repair.history.map((h) => [h.status, h]));
  const ended = repair.status === "cancelled" || repair.status === "declined";
  const currentIdx = FLOW.indexOf(repair.status);
  const upcoming = ended ? [] : FLOW.filter((s, i) => !done.has(s) && i > currentIdx);
  return (
    <ol className="mt-6 space-y-0">
      {repair.history.map((h, i) => {
        const isCurrent = i === repair.history.length - 1;
        return (
          <li key={`${h.status}-${h.at}`} className="relative flex gap-4 pb-6">
            <span aria-hidden="true" className="absolute left-[15px] top-8 h-full w-px bg-line" />
            <span className={cn("z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", isCurrent ? "bg-navy-900 text-white" : "bg-success text-white")}>{isCurrent && !ended && repair.status !== "completed" ? <Loader2 className="h-4 w-4" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}</span>
            <div><p className="font-bold">{LABEL[h.status] ?? h.status}{isCurrent && <span className="ml-2 text-xs font-semibold text-blue-500">Current</span>}</p>
              <p className="text-xs text-muted">{fmt(h.at)}</p>{h.note && <p className="mt-1 text-sm">{h.note}</p>}</div>
          </li>
        );
      })}
      {upcoming.map((s) => (
        <li key={s} className="relative flex gap-4 pb-6 text-muted">
          <span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface"><Circle className="h-3 w-3" aria-hidden="true" /></span>
          <p className="pt-1 text-sm">{LABEL[s]} <span className="text-xs">(upcoming)</span></p>
        </li>
      ))}
    </ol>
  );
}

export function TrackClient({ initialTicket, configured }: { initialTicket?: string; configured: boolean }) {
  const [state, track, tracking] = useActionState<TrackState, FormData>(trackRepair, { kind: "idle" });
  const [decided, decide, deciding] = useActionState<TrackState, FormData>(decideQuote, { kind: "idle" });
  const view = decided.kind === "found" ? decided : state;
  const repair = view.kind === "found" ? view.repair : null;
  const q = repair?.quote;

  return (
    <div>
      {!configured && <p className="mb-5 rounded-lg border border-gold-400/50 bg-gold-100 p-3 text-sm" role="note">Online tracking isn’t switched on yet. Contact us with your ticket number for an update.</p>}
      <form action={track} className="grid gap-4 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div><label htmlFor="t-ticket" className="mb-1.5 block text-sm font-semibold">Ticket number</label><input id="t-ticket" name="ticket" required defaultValue={initialTicket} placeholder="FSR-1001" autoCapitalize="characters" className={input} /></div>
        <div><label htmlFor="t-secret" className="mb-1.5 block text-sm font-semibold">Phone number or tracking key</label><input id="t-secret" name="secret" required autoComplete="tel" className={input} /></div>
        <button disabled={tracking || !configured} className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-navy-900 px-6 font-semibold text-white hover:bg-navy-800 disabled:opacity-50">{tracking && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Track</button>
      </form>

      <div aria-live="polite">
        {view.kind === "error" && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-danger" role="alert">{view.message}</p>}
        {decided.kind === "error" && state.kind === "found" && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-danger" role="alert">{decided.message}</p>}
        {view.kind === "found" && view.notice && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-success" role="status">{view.notice}</p>}
      </div>

      {repair && (
        <section className="mt-8 rounded-2xl border border-line bg-surface p-6" aria-labelledby="tr-h">
          <p className="text-xs font-bold uppercase tracking-wider text-gold-600">{repair.ticket_number}</p>
          <h2 id="tr-h" className="text-2xl font-extrabold text-ink">{repair.device}</h2>
          <p className="text-sm text-muted">{repair.issue}{repair.technician_first_name && <> · Technician: {repair.technician_first_name}</>}{repair.appointment && <> · Appointment: {fmt(repair.appointment)}</>}</p>

          {q && (
            <div className="mt-6 rounded-xl border border-line bg-surface-2 p-5">
              <h3 className="font-extrabold">Quotation</h3>
              <dl className="mt-3 grid grid-cols-[1fr_auto] gap-y-1.5 text-sm">
                <dt>Parts</dt><dd>{money(q.parts_total)}</dd><dt>Labour</dt><dd>{money(q.labour_total)}</dd><dt>Tax</dt><dd>{money(q.tax_total)}</dd>
                <dt className="font-bold">Total</dt><dd className="font-bold">{money(q.total)}</dd>
              </dl>
              {q.valid_until && <p className="mt-2 text-xs text-muted">Valid until {q.valid_until}</p>}
              {q.notes && <p className="mt-2 text-sm">{q.notes}</p>}
              {q.status === "sent" ? (
                <form action={decide} className="mt-4 flex flex-wrap gap-3">
                  <input type="hidden" name="ticket" value={repair.ticket_number} /><input type="hidden" name="secret" value={(view as { secret: string }).secret} /><input type="hidden" name="quoteId" value={q.id} />
                  <button name="decision" value="approve" disabled={deciding} className="h-12 cursor-pointer rounded-lg bg-navy-900 px-6 font-semibold text-white hover:bg-navy-800 disabled:opacity-50">Approve quotation</button>
                  <button name="decision" value="decline" disabled={deciding} className="h-12 cursor-pointer rounded-lg border border-line bg-surface px-6 font-semibold text-ink hover:bg-surface-2 disabled:opacity-50">Decline</button>
                </form>
              ) : <p className="mt-3 text-sm font-semibold">Status: {q.status}</p>}
            </div>
          )}
          <Timeline repair={repair} />
        </section>
      )}
    </div>
  );
}
