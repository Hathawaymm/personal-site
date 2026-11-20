"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { shellCopy, tx } from "@/data/portfolio-data";
import { LanguageProvider, useLang } from "../portfolio/lang";
import PublicNav from "../portfolio/PublicNav";
import RetroOS from "./RetroOS";

const BakedStudy = dynamic(() => import("./BakedStudy"), { ssr: false, loading: () => <div className="h-[70vh] bg-[#120e0c]" /> });

export default function DeskExperience() {
  return (
    <LanguageProvider>
      <DeskFrame />
    </LanguageProvider>
  );
}

function DeskFrame() {
  const { lang } = useLang();
  const [phase, setPhase] = useState<"room" | "os">("room");
  const [intent, setIntent] = useState<"auto" | "desk" | "monitor">("auto");
  const [compact, setCompact] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const apply = () => setCompact(media.matches);
    apply();
    media.addEventListener("change", apply);
    try {
      const canvas = document.createElement("canvas");
      setWebgl(Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")));
    } catch {
      setWebgl(false);
    }
    return () => media.removeEventListener("change", apply);
  }, []);

  const showScene = phase === "room" && webgl && !compact;

  return (
    <div className="space-ui min-h-screen bg-[#120e0c] text-[#f4ead8]">
      <PublicNav tone="dark" />
      {phase === "os" ? (
        <RetroOS onBack={() => { setPhase("room"); setIntent("desk"); }} />
      ) : (
        <div className="relative h-[calc(100vh-52px)]">
          {showScene ? (
            <BakedStudy intent={intent} onReady={() => {}} />
          ) : (
            <FallbackRoom onEnter={() => setPhase("os")} />
          )}
          <div className="pointer-events-none absolute bottom-6 left-6 z-30">
            <div className="pointer-events-auto flex flex-col items-stretch gap-2 rounded-2xl border border-white/10 bg-[#120e0c]/85 p-3 shadow-lg backdrop-blur-md">
              <button type="button" onClick={() => setIntent("monitor")} className="rounded-full bg-[#f4ead8] px-4 py-2 text-sm font-medium text-[#1a1208]">
                {tx(shellCopy.deskEnter, lang)}
              </button>
              <button type="button" onClick={() => setPhase("os")} className="rounded-full border border-[#f4ead8]/30 px-4 py-2 text-sm text-[#f4ead8]">
                {tx(shellCopy.deskSkip, lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FallbackRoom({ onEnter }: { onEnter: () => void }) {
  const { lang } = useLang();
  return (
    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_center,#3a2a1c,#120e0c_70%)]">
      <button type="button" onClick={onEnter} className="w-64 rounded-lg border-8 border-[#2a241e] bg-[#10241c] p-6 text-left text-[#d7ffe0] shadow-[0_0_40px_rgba(255,210,150,0.25)]">
        <p className="font-display text-2xl">ZoeOS 98</p>
        <p className="mt-3 text-sm">{tx(shellCopy.deskEnter, lang)}</p>
      </button>
    </div>
  );
}
