"use client";

import { ui, tx } from "@/data/portfolio-data";
import CareerHeader from "./CareerHeader";
import { LanguageProvider, useLang } from "./lang";
import PortfolioView from "./PortfolioView";
import PrintableResume from "./PrintableResume";

export default function CareerPage({ mode }: { mode: "portfolio" | "resume" }) {
  return (
    <LanguageProvider>
      <CareerFrame mode={mode} />
    </LanguageProvider>
  );
}

function CareerFrame({ mode }: { mode: "portfolio" | "resume" }) {
  const { lang } = useLang();

  return (
    <div className="career-root film-grain min-h-screen bg-bg-cream text-text-primary">
      <a href="#career-content" className="career-no-print sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-bg-paper focus:px-3 focus:py-2">
        {tx(ui.skip, lang)}
      </a>
      <CareerHeader mode={mode} />
      <main id="career-content">
        {mode === "portfolio" ? <PortfolioView /> : <PrintableResume screen />}
        {mode === "portfolio" && <PrintableResume />}
      </main>
    </div>
  );
}
