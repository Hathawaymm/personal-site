"use client";

import RetroOS from "@/components/desk/RetroOS";
import { LanguageProvider } from "@/components/portfolio/lang";
import type { Lang } from "@/data/portfolio-data";

export default function DeskOsClient({ initialLang = "en" }: { initialLang?: Lang }) {
  return (
    <LanguageProvider initialLang={initialLang}>
    <RetroOS fill onBack={() => {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "leave-monitor" }, window.location.origin);
      }
    }} />
    </LanguageProvider>
  );
}
