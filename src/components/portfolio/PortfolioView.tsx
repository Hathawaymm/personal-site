"use client";

import { credentials, education, experience, heroMetrics, profile, skillGroups, tx, ui } from "@/data/portfolio-data";
import { useLang } from "./lang";
import { contactItems } from "./CareerHeader";
import { IconGitHub, IconMail, IconPin, IconLink } from "./icons";
import Governance from "./Governance";
import ProjectBoard, { SectionIndex } from "./ProjectBoard";

const CONTACT_ICON = {
  email: IconMail,
  github: IconGitHub,
  location: IconPin,
  linkedin: IconLink,
} as const;

export default function PortfolioView() {
  const { lang } = useLang();
  const contacts = contactItems(lang);

  return (
    <div className="career-screen-only">
      <section className="border-b border-accent-gold/20">
        <div className="mx-auto grid max-w-6xl lg:grid-cols-12">
          <div className="px-4 py-12 sm:px-6 lg:col-span-7 lg:py-16">
            <p className="text-xs tracking-[0.22em] text-gold-strong uppercase">{tx(profile.kicker, lang)}</p>
            <h1 className="diary-title mt-4 text-5xl leading-none text-balance sm:text-7xl">{tx(profile.name, lang)}</h1>
            <p className="mt-3 font-display text-lg text-text-secondary">
              {lang === "zh" ? `${profile.nameEn} · ${profile.aka}` : `${profile.nameZh} · ${profile.aka}`}
            </p>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-balance text-text-primary">{tx(profile.title, lang)}</p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-text-secondary">{tx(profile.summary, lang)}</p>
            <ul className="mt-6 flex flex-col gap-2 text-sm">
              {contacts.map((item) => {
                const Icon = CONTACT_ICON[item.key as keyof typeof CONTACT_ICON] ?? IconLink;
                const body = (
                  <>
                    <Icon className="size-4 text-gold-strong" />
                    <span className="text-text-muted">{item.label}</span>
                    <span className="text-text-primary">{item.value}</span>
                  </>
                );
                return (
                  <li key={item.key}>
                    {item.href ? (
                      <a href={item.href} className="inline-flex items-center gap-2 hover:text-gold-strong" {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}>
                        {body}
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2">{body}</span>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="caption-text mt-4 text-sm">{tx(ui.publicNote, lang)}</p>
          </div>
          <div className="flex bg-bg-warm px-4 py-10 sm:px-6 lg:col-span-5 lg:items-center lg:px-8 lg:py-16">
            <dl className="grid grid-cols-2 gap-px border border-accent-gold/30 bg-accent-gold/30 shadow-paper">
              {heroMetrics.map((metric) => (
                <div key={metric.label.zh} className="bg-bg-paper px-4 py-5">
                  <dt className="text-xs text-text-muted">{tx(metric.label, lang)}</dt>
                  <dd className="font-display mt-2 text-2xl text-text-primary sm:text-3xl">{tx(metric.value, lang)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <ProjectBoard />
      <Governance />

      <section id="timeline" className="scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionIndex index="03" title={tx(ui.experienceTitle, lang)} />
          <ol className="mt-10 space-y-8 border-l-2 border-accent-gold/40 pl-6">
            {experience.map((role) => (
              <li key={role.id} className="relative">
                <span className="absolute top-1.5 -left-[31px] size-3 rounded-full border-2 border-gold-strong bg-bg-cream" aria-hidden />
                <p className="text-xs tracking-wide text-gold-strong tabular-nums">{role.period}</p>
                <h3 className="diary-title mt-1 text-2xl">{tx(role.role, lang)}</h3>
                <p className="text-sm text-text-primary">{tx(role.company, lang)}</p>
                <p className="text-sm text-text-muted">{tx(role.unit, lang)}</p>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">{tx(role.summary, lang)}</p>
                <ul className="mt-3 max-w-3xl space-y-2">
                  {role.highlights.map((item) => (
                    <li key={item.zh} className="text-sm leading-relaxed text-text-secondary">
                      {tx(item, lang)}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            <li className="relative">
              <span className="absolute top-1.5 -left-[31px] size-3 rounded-full border-2 border-accent-gold bg-bg-cream" aria-hidden />
              <p className="text-xs tracking-wide text-gold-strong tabular-nums">{education.period}</p>
              <h3 className="diary-title mt-1 text-2xl">{tx(education.degree, lang)}</h3>
              <p className="text-sm text-text-primary">{tx(education.school, lang)}</p>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-secondary">{tx(education.detail, lang)}</p>
            </li>
          </ol>
        </div>
      </section>

      <section id="credentials" className="scroll-mt-24 border-t border-accent-gold/20 bg-bg-paper px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionIndex index="04" title={tx(ui.credentialsTitle, lang)} />
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {credentials.map((item) => (
              <li key={item.title.zh} className="border border-accent-gold/20 px-4 py-4">
                <h3 className="font-semibold text-text-primary">{tx(item.title, lang)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">{tx(item.detail, lang)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="skills" className="scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionIndex index="05" title={tx(ui.skillsTitle, lang)} />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {skillGroups.map((group) => (
              <div key={group.id}>
                <h3 className="text-sm font-semibold tracking-wide text-gold-strong">{tx(group.title, lang)}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item.zh} className="rounded-full border border-accent-gold/30 bg-bg-paper px-3 py-1 text-sm text-text-secondary">
                      {tx(item, lang)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-10 text-xs text-text-muted">© {new Date().getFullYear()} {profile.nameEn}</p>
        </div>
      </section>
    </div>
  );
}
