"use client";

import { LanguageProvider } from "@/components/portfolio/lang";
import RetroOS from "@/components/desk/RetroOS";

export default function DeskOsPage() {
  return (
    <LanguageProvider>
      <RetroOS fill onBack={() => {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: "leave-monitor" }, window.location.origin);
        }
      }} />
    </LanguageProvider>
  );
}