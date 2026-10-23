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
    <div className="min-h-screen bg-[#F6F3EA] text-[#243238]">
      <header className="border-b border-[#E2E5DF] bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8 sm:py-10">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-plum-900 transition-colors"
          >
            ← Back to TutorNest
          </Link>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#243238] sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-xs text-slate-500">Last updated {lastUpdated}</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-6 py-10 md:grid-cols-[240px_1fr]">
        {/* Sticky in-page nav */}
        <nav
          aria-label="Table of contents"
          className="hidden md:block"
        >
          <div className="sticky top-20 space-y-1 border-l border-[#E2E5DF] pl-4">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`block py-1 text-xs transition-colors ${
                  activeId === s.id
                    ? "font-bold text-plum-900 border-l-2 border-plum-900 -ml-[17px] pl-[15px]"
                    : "text-slate-500 hover:text-[#243238]"
                }`}
              >
                {s.title}
              </a>
            ))}
          </div>
        </nav>

        <div className="min-w-0 max-w-3xl">
          <article className="space-y-5 text-slate-700 leading-relaxed text-xs sm:text-sm [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#243238] [&_h2]:pt-6 [&_h2]:pb-1.5 [&_h2]:border-b [&_h2]:border-[#E2E5DF] [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-[#243238] [&_h3]:pt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:text-slate-700 [&_a]:text-plum-900 [&_a]:underline hover:[&_a]:text-plum-950 [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_th]:border [&_th]:border-[#E2E5DF] [&_th]:bg-[#F6F3EA] [&_th]:p-2.5 [&_th]:text-left [&_th]:font-bold [&_th]:text-xs [&_td]:border [&_td]:border-[#E2E5DF] [&_td]:p-2.5 [&_td]:text-xs">
            {children}
          </article>

          <div className="mt-12 rounded-2xl border border-[#E2E5DF] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Related policies</p>
            <div className="mt-2.5 flex flex-wrap gap-4 text-xs font-medium">
              <Link href="/terms" className="text-plum-900 hover:underline">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-plum-900 hover:underline">
                Privacy Policy
              </Link>
              <Link href="/refund-policy" className="text-plum-900 hover:underline">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
