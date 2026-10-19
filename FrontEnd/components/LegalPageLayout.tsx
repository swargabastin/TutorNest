"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Section {
  id: string;
  title: string;
}

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  sections: Section[];
  children: React.ReactNode;
}

/**
 * Shared shell for /terms, /privacy, /refund-policy.
 * Sticky in-page nav on desktop (collapses on mobile), consistent header,
 * and a persistent cross-link footer so nobody reads one policy in isolation.
 */
export default function LegalPageLayout({
  title,
  lastUpdated,
  sections,
  children,
}: LegalPageLayoutProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <Link
            href="/"
            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← HomeTutor
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">Last updated {lastUpdated}</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-[240px_1fr]">
        {/* Sticky in-page nav — hidden on mobile to save space, content stays linear there */}
        <nav
          aria-label="Table of contents"
          className="hidden md:block"
        >
          <div className="sticky top-10 space-y-1 border-l border-slate-200 pl-4">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`block py-1 text-sm transition-colors ${
                  activeId === s.id
                    ? "font-semibold text-teal-600 border-l-2 border-teal-600 -ml-[17px] pl-[15px]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {s.title}
              </a>
            ))}
          </div>
        </nav>

        <div className="min-w-0 max-w-3xl">
          <article className="space-y-6 text-slate-700 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:pt-8 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-slate-100 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h3]:pt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_li]:text-slate-700 [&_a]:text-teal-600 [&_a]:underline hover:[&_a]:text-teal-700 [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:p-3 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-slate-200 [&_td]:p-3 [&_td]:text-sm">
            {children}
          </article>

          <div className="mt-16 rounded-lg border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-900">Related policies</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <Link href="/terms" className="text-teal-600 hover:underline">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-teal-600 hover:underline">
                Privacy Policy
              </Link>
              <Link href="/refund-policy" className="text-teal-600 hover:underline">
                Refund &amp; Cancellation Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
