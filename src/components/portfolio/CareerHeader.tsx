"use client";

import Link from "next/link";
import { profile as seedProfile, tx, ui, type Lang } from "@/data/portfolio-data";
import type { CareerDocument } from "@/data/career-document";
import { useCareer } from "./career-context";
import { useLang } from "./lang";
import { IconPrint } from "./icons";

const PORTFOLIO_LINKS = [
  { href: "#projects", label: ui.navProjects },
  { href: "#governance", label: ui.navGovernance },
  { href: "#timeline", label: ui.navTimeline },
  { href: "#credentials", label: ui.navCredentials },
] as const;

export default function CareerHeader({ mode }: { mode: "portfolio" | "resume" }) {
  const { lang, setLang } = useLang();
  const { profile } = useCareer();

  return (
    <header className="career-no-print sticky top-0 z-40 border-b border-accent-gold/20 bg-bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/portfolio" className="font-display text-base font-bold tracking-wide text-text-primary">
          {tx(profile.name, lang)}
          <span className="ml-2 hidden text-xs font-normal tracking-normal text-text-muted sm:inline">
            {lang === "zh" ? profile.nameEn : profile.nameZh}
          </span>
        </Link>

        <nav className="order-3 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto sm:flex-1" aria-label={tx(ui.portfolio, lang)}>
          {mode === "portfolio" ? (
            PORTFOLIO_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="shrink-0 px-2.5 py-1 text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                {tx(link.label, lang)}
              </a>
            ))
          ) : (
            <Link href="/portfolio" className="px-2.5 py-1 text-sm text-text-secondary hover:text-text-primary">
              {tx(ui.viewPortfolio, lang)}
            </Link>
          )}
          {mode === "portfolio" && (
            <Link href="/resume" className="shrink-0 px-2.5 py-1 text-sm text-gold-strong hover:opacity-80">
              {tx(ui.viewResume, lang)}
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex rounded-full border border-accent-gold/30 bg-bg-paper p-0.5" role="group" aria-label={tx(ui.langSwitch, lang)}>
            <LangButton active={lang === "zh"} onClick={() => setLang("zh")} label={ui.langZh} />
            <LangButton active={lang === "en"} onClick={() => setLang("en")} label={ui.langEn} />
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold-strong px-3 py-1.5 text-sm font-medium text-white shadow-paper transition-transform hover:opacity-95 motion-safe:active:scale-[0.98]"
          >
            <IconPrint className="size-4" />
            <span className="hidden sm:inline">{tx(ui.print, lang)}</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function LangButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active ? "bg-gold-strong text-white" : "text-text-secondary hover:text-text-primary"
      }`}
    >
      {label}
    </button>
  );
}

export function contactItems(lang: Lang, profile: CareerDocument["profile"] = seedProfile) {
  const items: { key: string; href: string; label: string; value: string; external?: boolean }[] = [
    { key: "email", href: `mailto:${profile.email}`, label: tx(ui.contactEmail, lang), value: profile.email },
    { key: "github", href: profile.github, label: tx(ui.contactGitHub, lang), value: profile.githubLabel, external: true },
    { key: "location", href: "", label: tx(ui.contactLocation, lang), value: tx(profile.location, lang) },
  ];
  if (profile.linkedin) {
    items.push({
      key: "linkedin",
      href: profile.linkedin,
      label: tx(ui.contactLinkedIn, lang),
      value: "LinkedIn",
      external: true,
    });
  }
  return items;
}
