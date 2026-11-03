import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-gold-600">404</p>
      <h1 className="mt-2 text-3xl font-extrabold text-ink">We couldn’t find that page</h1>
      <p className="mt-3 text-muted">It may have moved, or the link may be wrong.</p>
      <div className="mt-6 flex justify-center gap-3">
        <ButtonLink href="/shop">Browse the shop</ButtonLink>
        <Link href="/" className="inline-flex h-11 items-center px-4 text-sm font-semibold text-blue-400 underline">Home</Link>
      </div>
    </div>
  );
}
