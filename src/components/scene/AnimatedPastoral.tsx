"use client";

import { useEffect, useRef } from "react";

function GrassCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let rid = 0;
    let blades: { x: number; h: number; phase: number; speed: number }[] = [];
    const resize = () => {
      const r = c.parentElement!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      c.width = r.width * dpr; c.height = r.height * dpr;
      c.style.width = r.width + "px"; c.style.height = r.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.floor(r.width / 28);
      blades = Array.from({ length: count }, (_, i) => ({
        x: (i / count) * r.width + (Math.random() - 0.5) * 20,
        h: 14 + Math.random() * 36,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.2,
      }));
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = (t: number) => {
      ctx.clearRect(0, 0, c.width, c.height);
      const baseY = c.parentElement!.getBoundingClientRect().height * 0.88;
      for (const b of blades) {
        const sw = Math.sin(t * 0.001 * b.speed + b.phase) * 4;
        ctx.beginPath();
        ctx.moveTo(b.x, baseY);
        ctx.quadraticCurveTo(b.x + sw * 0.5, baseY - b.h * 0.55, b.x + sw, baseY - b.h);
        ctx.strokeStyle = "rgba(130,170,70,0.32)"; ctx.lineWidth = 1.6; ctx.stroke();
      }
      rid = requestAnimationFrame(draw);
    };
    rid = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rid); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="pointer-events-none absolute inset-0 z-[5]" aria-hidden />;
}

function ScaledLayer({ zIndex, scale, src, animClass, offsetX, offsetY, style, loading }: {
  zIndex: number; scale: number; src: string; animClass: string; offsetX?: string; offsetY?: string; style?: React.CSSProperties; loading?: "lazy" | "eager";
}) {
  const tx = offsetX || "0";
  const ty = offsetY || "0";
  return (
    <div className="absolute inset-0" style={{ zIndex, transform: `scale(${scale}) translate(${tx}, ${ty})`, transformOrigin: "bottom center" }}>
      <img src={src} alt="" className={`absolute inset-0 h-full w-full object-cover ${animClass}`} style={style} loading={loading} />
    </div>
  );
}

export default function AnimatedPastoral() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg-warm">
      <img src="/images/background.png" alt="" className="absolute inset-0 h-full w-full object-cover" style={{ zIndex: 0 }} loading="eager" />
      <GrassCanvas />
      <ScaledLayer zIndex={10} scale={0.42} offsetY="-50%" src="/images/dog-collie.png" animClass="animate-pet" style={{ transformOrigin: "bottom center", animationDuration: "5s" }} loading="lazy" />
      <ScaledLayer zIndex={11} scale={0.34} offsetY="-52%" src="/images/cat-orange.png" animClass="animate-pet" style={{ transformOrigin: "bottom center", animationDuration: "5s", animationDelay: "1.2s" }} loading="lazy" />
      <ScaledLayer zIndex={12} scale={0.31} offsetY="-47%" src="/images/cat-white.png" animClass="animate-pet" style={{ transformOrigin: "bottom center", animationDuration: "5s", animationDelay: "2.5s" }} loading="lazy" />
      <ScaledLayer zIndex={20} scale={0.46} offsetX="-1%" offsetY="-62%" src="/images/woman.png" animClass="animate-human" style={{ transformOrigin: "bottom center", animationDuration: "6s" }} loading="lazy" />
      <ScaledLayer zIndex={21} scale={0.46} offsetX="1%"  offsetY="-62%" src="/images/man.png" animClass="animate-human" style={{ transformOrigin: "bottom center", animationDuration: "6s", animationDelay: "0.8s" }} loading="lazy" />
    </div>
  );
}
