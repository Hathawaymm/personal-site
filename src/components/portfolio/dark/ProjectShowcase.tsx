"use client";

import { useEffect, useMemo, useState } from "react";
import { projectSearchText, tx, ui, type EmployerId, type Project } from "@/data/portfolio-data";
import { useCareer } from "../career-context";
import { useLang } from "../lang";

type Filter = "all" | EmployerId;

export default function ProjectShowcase() {
  const { lang } = useLang();
  const { projects, employerFilters, shellCopy, profile } = useCareer();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((project) => {
      if (filter !== "all" && project.employer !== filter) return false;
      if (!q) return true;
      return projectSearchText(project, lang).includes(q);
    });
  }, [filter, query, lang, projects]);

  const open = projects.find((project) => project.id === openId) ?? null;

  return (
    <section id="projects">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <h2 className="font-display text-3xl text-[#f4ead8] sm:text-4xl">{tx(shellCopy.projectsTitle, lang)}</h2>
        <label className="block min-w-[220px]">
          <span className="sr-only">{tx(ui.searchLabel, lang)}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={tx(ui.searchPlaceholder, lang)}
            className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-[#f4ead8] outline-none placeholder:text-[#f4ead8]/40"
          />
        </label>
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto" role="tablist">
        {employerFilters.map((pill) => {
          const active = filter === pill.id;
          const count = pill.id === "all" ? projects.length : projects.filter((project) => project.employer === pill.id).length;
          return (
            <button
              key={pill.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(pill.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${active ? "bg-[#e4b15a] text-[#1a1208]" : "border border-white/15 text-[#f4ead8]/80"}`}
            >
              {tx(pill.label, lang)} <span className="tabular-nums">{count}</span>
            </button>
          );
        })}
      </div>
      {visible.length === 0 ? (
        <p className="mt-8 text-[#f4ead8]/70">{tx(ui.noResults, lang)}</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((project) => (
            <article key={project.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#101218]">
              <button type="button" onClick={() => setOpenId(project.id)} className="block w-full text-left">
                <Cover project={project} />
                <div className="px-4 py-4">
                  <p className="text-[11px] tracking-wide text-[#e4b15a]">{tx(employerFilters.find((item) => item.id === project.employer)?.label ?? ui.employers[project.employer], lang)} · {project.period}</p>
                  <h3 className="font-display mt-1 text-xl leading-snug text-[#f4ead8]">{tx(project.title, lang)}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[#f4ead8]/65">{tx(project.summary, lang)}</p>
                </div>
              </button>
            </article>
          ))}
        </div>
      )}
      {open && <CaseModal project={open} onClose={() => setOpenId(null)} />}
    </section>
  );
}

function coverSrc(project: Project & { cover?: string }): string {
  return project.cover || `/images/projects/${project.id}.svg`;
}

function Cover({ project }: { project: Project }) {
  const { lang } = useLang();
  const seed = [...project.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const accent = project.employer === "root" ? "#e4b15a" : project.employer === "bank" ? "#7ec8c3" : "#e07a5f";
  return (
    <div className="relative aspect-[3/2] overflow-hidden bg-[#16130f]">
      <img src={coverSrc(project)} alt="" className="h-full w-full origin-center object-cover transition duration-700 group-hover:scale-110" />
      <svg viewBox="0 0 300 200" className="pointer-events-none absolute inset-0 hidden" aria-hidden>
        <defs>
          <linearGradient id={`g-${project.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1a140f" />
            <stop offset="1" stopColor="#0c1016" />
          </linearGradient>
        </defs>
        <rect width="300" height="200" fill={`url(#g-${project.id})`} />
        {Array.from({ length: 6 }).map((_, index) => (
          <rect key={index} x={16 + ((seed + index * 37) % 220)} y={20 + index * 26} width={40 + (seed % 30)} height="8" fill={accent} opacity={0.25 + (index % 3) * 0.15} />
        ))}
        <circle cx={40 + (seed % 80)} cy={50} r={18 + (seed % 12)} fill="none" stroke={accent} strokeWidth="1.5" />
        <path d={`M20 160 C ${80 + (seed % 40)} 80, 180 140, 280 40`} fill="none" stroke={accent} strokeWidth="1.4" opacity="0.8" />
        <rect x="18" y="150" width="90" height="28" fill={accent} opacity="0.9" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <p className="text-xs tracking-wide text-white/90">{tx(project.domain, lang)}</p>
      </div>
    </div>
  );
}

function CaseModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { lang } = useLang();
  const { shellCopy, profile } = useCareer();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-title"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#101218] text-[#f4ead8] sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-white/10 bg-[#101218]/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-[11px] tracking-[0.16em] text-[#e4b15a] uppercase">{tx(ui.employers[project.employer], lang)} · {project.period}</p>
            <h2 id="case-title" className="font-display mt-1 text-2xl">{tx(project.title, lang)}</h2>
            <p className="mt-1 text-sm text-[#f4ead8]/65">{tx(project.role, lang)} · {tx(project.org, lang)}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/15 px-3 py-1 text-sm" aria-label={tx(shellCopy.close, lang)}>
            {tx(shellCopy.close, lang)}
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-5">
          <p className="text-sm leading-relaxed text-[#f4ead8]/80">{tx(project.summary, lang)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.metrics.map((metric) => (
              <span key={metric.zh} className="rounded-full border border-[#e4b15a]/40 px-2.5 py-1 text-xs text-[#f0c27a]">{tx(metric, lang)}</span>
            ))}
          </div>
          {project.links && project.links.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {project.links.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="text-sm text-[#7ec8c3] underline-offset-4 hover:underline">
                  {tx(link.label, lang)}
                </a>
              ))}
            </div>
          )}
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <Column title={tx(ui.context, lang)} items={project.context} />
            <Column title={tx(ui.actions, lang)} items={project.actions} />
            <Column title={tx(ui.impact, lang)} items={project.impact} />
          </div>
          <p className="mt-6 text-xs text-[#f4ead8]/40">{profile.email}</p>
        </div>
      </div>
    </div>
  );
}

function Column({ title, items }: { title: string; items: { zh: string; en: string }[] }) {
  const { lang } = useLang();
  return (
    <div>
      <h3 className="text-[11px] tracking-[0.16em] text-[#e4b15a] uppercase">{title}</h3>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item.zh} className="border-l border-white/15 pl-2 text-sm leading-relaxed text-[#f4ead8]/75">{tx(item, lang)}</li>
        ))}
      </ul>
    </div>
  );
}
