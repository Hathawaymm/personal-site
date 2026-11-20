"use client";

import type { ReactNode } from "react";
import { governance, tx } from "@/data/portfolio-data";
import { useLang } from "./lang";
import { SectionIndex } from "./ProjectBoard";

export default function Governance() {
  const { lang } = useLang();

  return (
    <section id="governance" className="scroll-mt-24 border-y border-accent-gold/20 bg-bg-warm/60 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs tracking-[0.18em] text-gold-strong uppercase">{tx(governance.eyebrow, lang)}</p>
        <div className="mt-3">
          <SectionIndex index="02" title={tx(governance.title, lang)} lede={tx(governance.lede, lang)} />
        </div>

        <div className="mt-10 space-y-6">
          <Blueprint>
            <BlueprintHead index="01" title={tx(governance.gates.title, lang)} where={tx(governance.gates.where, lang)} />
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">{tx(governance.gates.lede, lang)}</p>
            <ol className="mt-6 grid gap-3 md:grid-cols-4">
              {governance.gates.stages.map((stage, index) => (
                <li key={stage.title.zh} className="relative border border-dashed border-accent-gold/50 bg-bg-paper p-4">
                  <span className="font-display text-2xl text-gold-strong">{String(index + 1).padStart(2, "0")}</span>
                  {index < governance.gates.stages.length - 1 && (
                    <span className="absolute top-7 -right-3 hidden text-accent-gold md:block" aria-hidden>
                      →
                    </span>
                  )}
                  <h3 className="mt-2 font-semibold text-text-primary">{tx(stage.title, lang)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{tx(stage.detail, lang)}</p>
                </li>
              ))}
            </ol>
            <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {governance.gates.signals.map((signal) => (
                <div key={signal.label.zh} className="bg-bg-paper px-4 py-3 shadow-paper">
                  <dt className="text-xs text-text-muted">{tx(signal.label, lang)}</dt>
                  <dd className="font-display mt-1 text-2xl text-text-primary">{tx(signal.value, lang)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 border-l-2 border-gold-strong pl-3 text-sm leading-relaxed text-text-secondary">
              {tx(governance.gates.board, lang)}
            </p>
          </Blueprint>

          <Blueprint>
            <BlueprintHead index="02" title={tx(governance.standards.title, lang)} where={tx(governance.standards.where, lang)} />
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">{tx(governance.standards.lede, lang)}</p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {governance.standards.cards.map((card, index) => (
                <article key={card.title.zh} className="bg-bg-paper p-5 shadow-paper">
                  <p className="text-xs tracking-[0.16em] text-gold-strong">0{index + 1}</p>
                  <h3 className="mt-2 font-semibold text-text-primary">{tx(card.title, lang)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{tx(card.detail, lang)}</p>
                </article>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-text-muted">{tx(governance.standards.also, lang)}</p>
          </Blueprint>

          <Blueprint>
            <BlueprintHead index="03" title={tx(governance.risk.title, lang)} where={tx(governance.risk.where, lang)} />
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">{tx(governance.risk.lede, lang)}</p>
            <div className="mt-6 grid gap-3 lg:grid-cols-3">
              {governance.risk.cards.map((card) => (
                <article key={card.title.zh} className="border-t-2 border-gold-strong bg-bg-paper p-5">
                  <h3 className="font-semibold text-text-primary">{tx(card.title, lang)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{tx(card.detail, lang)}</p>
                </article>
              ))}
            </div>
          </Blueprint>

          <Blueprint>
            <BlueprintHead index="04" title={tx(governance.audit.title, lang)} where={tx(governance.audit.where, lang)} />
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">{tx(governance.audit.lede, lang)}</p>
            <ol className="mt-6 grid gap-0 md:grid-cols-4">
              {governance.audit.stages.map((stage, index) => (
                <li key={stage.title.zh} className="relative border border-accent-gold/30 bg-bg-paper p-4 md:border-r-0 md:last:border-r">
                  <span className="flex size-7 items-center justify-center rounded-full bg-gold-strong text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-text-primary">{tx(stage.title, lang)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{tx(stage.detail, lang)}</p>
                </li>
              ))}
            </ol>
            <p className="caption-text mt-4 text-sm">{tx(governance.audit.note, lang)}</p>
          </Blueprint>
        </div>
      </div>
    </section>
  );
}

function Blueprint({ children }: { children: ReactNode }) {
  return <div className="border border-accent-gold/25 bg-bg-cream/80 p-5 sm:p-6">{children}</div>;
}

function BlueprintHead({ index, title, where }: { index: string; title: string; where: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h3 className="diary-title text-xl sm:text-2xl">
        <span className="mr-2 text-gold-strong">{index}</span>
        {title}
      </h3>
      <p className="text-xs tracking-wide text-text-muted">{where}</p>
    </div>
  );
}
