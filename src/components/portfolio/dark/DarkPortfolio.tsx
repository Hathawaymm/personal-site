"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { tx, ui, type Lang } from "@/data/portfolio-data";
import { useCareer } from "../career-context";
import { LanguageProvider, useLang } from "../lang";
import PublicNav from "../PublicNav";
import PrintableResume from "../PrintableResume";
import ProjectShowcase from "./ProjectShowcase";

const ZoeKeyboard = dynamic(() => import("../keyboard/ZoeKeyboard"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

export default function DarkPortfolio({ initialLang = "en" }: { initialLang?: Lang }) {
  const { profile, shellCopy } = useCareer();
  return (
    <LanguageProvider initialLang={initialLang}>
    <div className="space-ui career-root min-h-screen bg-[#07080c] text-[#f4ead8]">
      <Starfield />
      <ZoeKeyboard />
      <PublicNav tone="dark" />
      <main className="career-screen-only career-hit-through relative z-10">
        <Hero />
        <section id="skills" className="relative z-10 mx-auto min-h-[80dvh] max-w-6xl px-4 py-24 sm:px-6">
          <h2 className="font-display text-4xl sm:text-6xl">{txWait(shellCopy.keyboardTitle)}</h2>
          <KeyboardLede />
        </section>
        <Timeline />
        <GovernanceDeck />
        <section id="projects" className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <ProjectShowcase />
          </Reveal>
        </section>
        <section id="contact" className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <h2 className="font-display text-4xl">Contact</h2>
          <ContactBlock />
        </section>
        <p className="px-4 pb-10 text-center text-xs text-[#f4ead8]/40">© {new Date().getFullYear()} {profile.nameEn}</p>
      </main>
      <PrintableResume />
    </div>
    </LanguageProvider>
  );
}

function txWait(copy: { zh: string; en: string }) {
  return <Bound text={copy} />;
}

function Bound({ text }: { text: { zh: string; en: string } }) {
  const { lang } = useLang();
  return <>{tx(text, lang)}</>;
}

function KeyboardLede() {
  const { lang } = useLang();
  const { shellCopy, keyboardSkills } = useCareer();
  return <p className="mt-2 max-w-2xl text-sm text-[#f4ead8]/70">{tx(shellCopy.keyboardLede, lang)} · {keyboardSkills.length}</p>;
}

function Hero() {
  const { lang } = useLang();
  const { profile, heroMetrics } = useCareer();
  return (
    <section id="hero" className="relative z-10 mx-auto grid min-h-[100dvh] max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <p className="text-xs tracking-[0.22em] text-[#e4b15a] uppercase">{tx(profile.kicker, lang)}</p>
        <h1 className="font-display mt-4 text-5xl leading-none sm:text-7xl">{tx(profile.name, lang)}</h1>
        <p className="mt-3 text-lg text-[#f4ead8]/70">{lang === "zh" ? `${profile.nameEn} · ${profile.aka}` : `${profile.nameZh} · ${profile.aka}`}</p>
        <p className="mt-5 max-w-xl text-lg leading-relaxed">{tx(profile.title, lang)}</p>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[#f4ead8]/70">{tx(profile.summary, lang)}</p>
        <ul className="mt-6 space-y-1 text-sm">
          <li><a className="text-[#7ec8c3]" href={`mailto:${profile.email}`}>{profile.email}</a></li>
          <li><a className="text-[#7ec8c3]" href={profile.github}>{profile.githubLabel}</a></li>
          <li>{tx(profile.location, lang)}</li>
        </ul>
      </div>
      <div className="lg:col-span-5">
        <Image
          src="/images/zoe/seaside.webp"
          alt={tx(profile.name, lang)}
          width={1280}
          height={1706}
          priority
          sizes="(max-width: 1024px) 90vw, 420px"
          className="mb-4 h-auto w-full max-w-sm rounded-3xl object-contain object-[62%_center] shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
        />
      <dl className="grid grid-cols-2 gap-3">
        {heroMetrics.map((metric) => (
          <div key={metric.label.zh} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <dt className="text-xs text-[#f4ead8]/55">{tx(metric.label, lang)}</dt>
            <dd className="font-display mt-2 text-3xl text-[#f0c27a]">{tx(metric.value, lang)}</dd>
          </div>
        ))}
      </dl>
      </div>
    </section>
  );
}

function Timeline() {
  const { lang } = useLang();
  const { experience, education, credentials } = useCareer();
  return (
    <section id="experience" className="relative z-10 border-y border-white/10 bg-[#07080c]/80">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="font-display text-3xl sm:text-4xl">{tx(ui.experienceTitle, lang)}</h2>
          <ol className="mt-8 space-y-8 border-l border-[#e4b15a]/50 pl-6">
            {experience.map((role) => (
              <li key={role.id}>
                <p className="text-xs tracking-wide text-[#e4b15a] tabular-nums">{role.period}</p>
                <h3 className="font-display mt-1 text-2xl">{tx(role.role, lang)}</h3>
                <p className="text-sm">{tx(role.company, lang)}</p>
                <p className="text-sm text-[#f4ead8]/55">{tx(role.unit, lang)}</p>
                <ul className="mt-3 max-w-3xl space-y-2">
                  {role.highlights.map((item) => (
                    <li key={item.zh} className="text-sm leading-relaxed text-[#f4ead8]/75">{tx(item, lang)}</li>
                  ))}
                </ul>
              </li>
            ))}
            <li>
              <p className="text-xs tracking-wide text-[#e4b15a] tabular-nums">{education.period}</p>
              <h3 className="font-display mt-1 text-2xl">{tx(education.degree, lang)}</h3>
              <p className="text-sm">{tx(education.school, lang)}</p>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#f4ead8]/75">{tx(education.detail, lang)}</p>
            </li>
          </ol>
          <ul className="mt-8 grid gap-3 md:grid-cols-2">
            {credentials.map((item) => (
              <li key={item.title.zh} className="rounded-xl border border-white/10 px-4 py-3">
                <h3 className="font-semibold">{tx(item.title, lang)}</h3>
                <p className="mt-1 text-sm text-[#f4ead8]/70">{tx(item.detail, lang)}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

const TABS = ["gates", "standards", "risk", "audit"] as const;

function GovernanceDeck() {
  const { lang } = useLang();
  const { governance } = useCareer();
  const [tab, setTab] = useState<(typeof TABS)[number]>("gates");
  return (
    <section id="governance" className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Reveal>
        <p className="text-xs tracking-[0.18em] text-[#7ec8c3] uppercase">{tx(governance.eyebrow, lang)}</p>
        <h2 className="font-display mt-2 text-3xl sm:text-4xl">{tx(governance.title, lang)}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#f4ead8]/70">{tx(governance.lede, lang)}</p>
        <div className="mt-6 flex gap-2 overflow-x-auto" role="tablist">
          {TABS.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${tab === id ? "bg-[#7ec8c3] text-[#06211f]" : "border border-white/15 text-[#f4ead8]/80"}`}
            >
              {tx(governance[id].title, lang)}
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-[#7ec8c3]/30 bg-[#0e1418] p-5" role="tabpanel">
          <p className="text-xs text-[#7ec8c3]">{tx(governance[tab].where, lang)}</p>
          <p className="mt-2 text-sm leading-relaxed text-[#f4ead8]/80">{tx(governance[tab].lede, lang)}</p>
          {tab === "gates" && (
            <>
              <ol className="mt-4 grid gap-3 md:grid-cols-4">
                {governance.gates.stages.map((stage, index) => (
                  <li key={stage.title.zh} className="rounded-xl border border-dashed border-[#e4b15a]/40 p-3">
                    <span className="font-display text-xl text-[#e4b15a]">0{index + 1}</span>
                    <h3 className="mt-1 font-semibold">{tx(stage.title, lang)}</h3>
                    <p className="mt-1 text-sm text-[#f4ead8]/70">{tx(stage.detail, lang)}</p>
                  </li>
                ))}
              </ol>
              <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {governance.gates.signals.map((signal) => (
                  <div key={signal.label.zh} className="rounded-xl bg-white/5 p-3">
                    <dt className="text-xs text-[#f4ead8]/50">{tx(signal.label, lang)}</dt>
                    <dd className="font-display text-2xl text-[#f0c27a]">{tx(signal.value, lang)}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-sm text-[#f4ead8]/75">{tx(governance.gates.board, lang)}</p>
            </>
          )}
          {tab === "standards" && (
            <>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {governance.standards.cards.map((card) => (
                  <article key={card.title.zh} className="rounded-xl border border-white/10 p-4">
                    <h3 className="font-semibold">{tx(card.title, lang)}</h3>
                    <p className="mt-2 text-sm text-[#f4ead8]/70">{tx(card.detail, lang)}</p>
                  </article>
                ))}
              </div>
              <p className="mt-3 text-sm text-[#f4ead8]/55">{tx(governance.standards.also, lang)}</p>
            </>
          )}
          {tab === "risk" && (
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {governance.risk.cards.map((card) => (
                <article key={card.title.zh} className="border-t-2 border-[#e4b15a] pt-3">
                  <h3 className="font-semibold">{tx(card.title, lang)}</h3>
                  <p className="mt-2 text-sm text-[#f4ead8]/70">{tx(card.detail, lang)}</p>
                </article>
              ))}
            </div>
          )}
          {tab === "audit" && (
            <>
              <ol className="mt-4 grid gap-3 md:grid-cols-4">
                {governance.audit.stages.map((stage, index) => (
                  <li key={stage.title.zh} className="rounded-xl border border-[#7ec8c3]/30 p-3">
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#7ec8c3] text-xs font-semibold text-[#06211f]">{index + 1}</span>
                    <h3 className="mt-2 text-sm font-semibold">{tx(stage.title, lang)}</h3>
                    <p className="mt-2 text-sm text-[#f4ead8]/70">{tx(stage.detail, lang)}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-xs text-[#f4ead8]/45">{tx(governance.audit.note, lang)}</p>
            </>
          )}
        </div>
      </Reveal>
    </section>
  );
}

function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) setShown(true);
    }, { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal-block transition duration-700 ${shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
      {children}
    </div>
  );
}

function ContactBlock() {
  const { lang } = useLang();
  const { profile } = useCareer();
  return (
    <ul className="mt-4 space-y-2 text-lg">
      <li><a className="text-[#7ec8c3]" href={`mailto:${profile.email}`}>{profile.email}</a></li>
      <li><a className="text-[#7ec8c3]" href={profile.github}>{profile.githubLabel}</a></li>
      <li>{tx(profile.location, lang)}</li>
    </ul>
  );
}

function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.3,
    }));
    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      for (const star of stars) {
        ctx.fillStyle = `rgba(244, 234, 216, ${0.28 + star.r / 4})`;
        ctx.fillRect(star.x * width, star.y * height, star.r, star.r);
      }
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0 h-full w-full" aria-hidden />;
}
