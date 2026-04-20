"use client";

import Link from "next/link";

/** «Үндсэн үзүүлэлтүүд» (statistics-dashboard) руу буцах — нэг мөр, босоо зай багатай */
export function SocioDashboardBackNav({ lng }: { lng: string }) {
  return (
    <div className="w-full min-w-0 border-b border-[var(--card-border,#e2e8f0)] bg-[var(--card-bg,#ffffff)] dark:border-slate-700 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-[90rem] px-3 py-2.5 sm:px-6 sm:py-2 md:px-8 lg:px-10">
        <Link
          href={`/${lng}/statistics-dashboard`}
          className="inline-flex min-h-11 max-w-full items-center gap-1 break-words text-sm font-medium text-[var(--primary,#0050c3)] underline-offset-2 hover:underline sm:min-h-0 dark:text-blue-400"
        >
          ← Үндсэн үзүүлэлтүүд рүү буцах
        </Link>
      </div>
    </div>
  );
}
