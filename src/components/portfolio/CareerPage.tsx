"use client";

import { ui, tx, type Lang } from "@/data/portfolio-data";
import { LanguageProvider, useLang } from "./lang";
import PrintableResume from "./PrintableResume";
import PublicNav from "./PublicNav";

export default function CareerPage({ initialLang = "en" }: { initialLang?: Lang }) {
  return (
    <LanguageProvider initialLang={initialLang}>
      <ResumeFrame />
    </LanguageProvider>
  );
}

function ResumeFrame() {
  const { lang } = useLang();

  return (
    <div className="career-root film-grain min-h-screen bg-bg-cream text-text-primary">
      <a href="#career-content" className="career-no-print sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-bg-paper focus:px-3 focus:py-2">
        {tx(ui.skip, lang)}
      </a>
      <PublicNav tone="paper" />
      <main id="career-content">
        <PrintableResume screen />
      </main>
    </div>
  );
}
