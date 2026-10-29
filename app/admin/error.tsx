"use client";

import { btn } from "@/components/admin/ui";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-md rounded-xl border border-destructive/40 bg-card p-6 text-center">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">This page couldn&apos;t load. {error.digest ? `Reference: ${error.digest}` : ""}</p>
      <button onClick={reset} className={`${btn.primary} mt-5`}>Try again</button>
    </div>
  );
}
