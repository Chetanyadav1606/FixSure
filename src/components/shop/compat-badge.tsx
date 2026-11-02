import { AlertTriangle, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { COMPAT_LABEL, type CompatStatus } from "@/lib/compat";

const STYLE: Record<CompatStatus, { cls: string; Icon: typeof CheckCircle2 }> = {
  confirmed: { cls: "bg-green-50 text-success ring-green-200", Icon: CheckCircle2 },
  potential: { cls: "bg-amber-50 text-warning ring-amber-200", Icon: AlertTriangle },
  unverified: { cls: "bg-slate-100 text-muted ring-slate-200", Icon: HelpCircle },
  incompatible: { cls: "bg-red-50 text-danger ring-red-200", Icon: XCircle },
};

/** Status is conveyed by icon + text, never colour alone. */
export function CompatBadge({ status }: { status: CompatStatus }) {
  const { cls, Icon } = STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${cls}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {COMPAT_LABEL[status]}
    </span>
  );
}
