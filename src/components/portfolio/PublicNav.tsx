"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { shellCopy, tx, ui } from "@/data/portfolio-data";
import { readSoundMuted, subscribeSoundMuted, writeSoundMuted } from "@/lib/sound-pref";
import { useLang } from "./lang";

const LINKS = [
  { href: "/portfolio", label: shellCopy.modes.portfolio },
  { href: "/desk", label: shellCopy.modes.desk },
  { href: "/resume", label: shellCopy.modes.resume },
] as const;

export default function PublicNav({ tone = "dark" }: { tone?: "dark" | "paper" }) {
  const pathname = usePathname();
  const { lang, setLang } = useLang();
  const dark = tone === "dark";
  const [muted, setMuted] = useState(false);
  const hears = pathname === "/portfolio" || pathname === "/desk";

  useEffect(() => {
    setMuted(readSoundMuted());
    return subscribeSoundMuted(setMuted);
  }, []);

  return (
    <header className={`career-no-print sticky top-0 z-40 border-b backdrop-blur-md ${dark ? "relative z-40 border-white/10 bg-[#07080c]/75 text-[#f4ead8]" : "border-accent-gold/20 bg-bg-cream/90 text-text-primary"}`}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-3 py-2.5 sm:px-5">
        <Link href="/portfolio" className="font-display text-sm font-bold tracking-wide">
          {lang === "zh" ? "张寒梅" : "Hanmei Zhang"}
        </Link>
        <nav className="flex flex-1 flex-wrap items-center gap-1" aria-label={tx(ui.langSwitch, lang)}>
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-2.5 py-1 text-xs sm:text-sm ${
                  active
                    ? dark ? "bg-[#e4b15a] text-[#1a1208]" : "bg-gold-strong text-white"
                    : dark ? "text-[#f4ead8]/75 hover:text-[#f4ead8]" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tx(link.label, lang)}
              </Link>
            );
          })}
        </nav>
        <div className={`flex rounded-full border p-0.5 ${dark ? "border-white/15 bg-white/5" : "border-accent-gold/30 bg-bg-paper"}`} role="group" aria-label={tx(ui.langSwitch, lang)}>
          <LangButton active={lang === "zh"} dark={dark} onClick={() => setLang("zh")} label={ui.langZh} />
          <LangButton active={lang === "en"} dark={dark} onClick={() => setLang("en")} label={ui.langEn} />
        </div>
        {hears && (
          <button
            type="button"
            aria-pressed={muted}
            onClick={() => writeSoundMuted(!muted)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${dark ? "border-white/15 text-[#f4ead8]" : "border-accent-gold/30 text-text-primary"}`}
          >
            {muted ? (lang === "zh" ? "开声音" : "Unmute") : (lang === "zh" ? "静音" : "Mute")}
          </button>
        )}
        {pathname === "/resume" && (
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full bg-gold-strong px-3 py-1 text-xs font-medium text-white sm:text-sm"
          >
            <span className="hidden sm:inline">{tx(ui.print, lang)}</span>
            <span className="sm:hidden">PDF</span>
          </button>
        )}
      </div>
    </header>
  );
}

function LangButton({ active, dark, onClick, label }: { active: boolean; dark: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        active
          ? dark ? "bg-[#e4b15a] text-[#1a1208]" : "bg-gold-strong text-white"
          : dark ? "text-[#f4ead8]/80" : "text-text-secondary"
      }`}
    >
      {label}
    </button>
  );
}
