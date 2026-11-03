"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center" role="alert">
      <h1 className="text-2xl font-extrabold text-ink">Something went wrong</h1>
      <p className="mt-2 text-muted">Please try again. If it keeps happening, contact us.</p>
      <Button className="mt-6" onClick={reset}>Try again</Button>
    </div>
  );
}
