"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Watermark() {
  const { isLoggedIn } = useAuth();
  const [patternUrl, setPatternUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    const controller = new AbortController();

    const render = (text: string) => {
      if (controller.signal.aborted) return;
      const canvas = document.createElement("canvas");
      const size = 200;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.font = "14px KaiTi, STKaiti, serif";
      ctx.fillStyle = "rgba(74, 53, 32, 0.06)";
      ctx.translate(size / 2, size / 2);
      ctx.rotate((-15 * Math.PI) / 180);
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0);

      if (!controller.signal.aborted) {
        setPatternUrl(canvas.toDataURL());
      }
    };

    fetch("/api/site-data", { signal: controller.signal })
      .then(r => r.json())
      .then(data => render(data?.settings?.watermarkText || "Hathawaymm"))
      .catch(() => {
        if (!controller.signal.aborted) render("Hathawaymm");
      });

    return () => controller.abort();
  }, [isLoggedIn]);

  if (!isLoggedIn || !patternUrl) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{ backgroundImage: `url(${patternUrl})`, backgroundRepeat: "repeat" }}
      aria-hidden="true"
    />
  );
}
