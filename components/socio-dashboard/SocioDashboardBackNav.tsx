"use client";

import Link from "next/link";

/** «Үндсэн үзүүлэлтүүд» (s-e-dashboard) руу буцах — нэг мөр, босоо зай багатай */
export function SocioDashboardBackNav({ lng }: { lng: string }) {
  return (
    <div className="w-full min-w-0 border-b border-[var(--card-border,#e2e8f0)] bg-[var(--card-bg,#ffffff)] dark:border-slate-700 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-[90rem] px-3 py-1.5 sm:px-5 sm:py-1.5 lg:px-8">
        <Link
          href={`/${lng}/s-e-dashboard`}
          className="text-sm font-medium text-[var(--primary,#0050c3)] hover:underline dark:text-blue-400"
        >
          ← Үндсэн үзүүлэлтүүд рүү буцах
        </Link>
      </div>
    </div>
  );
}
