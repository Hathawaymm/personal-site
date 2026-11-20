"use client";

import { useMemo, useState } from "react";
import {
  categoryOrder,
  projectSearchText,
  projects,
  tx,
  ui,
  type Project,
  type ProjectCategory,
} from "@/data/portfolio-data";
import { useLang } from "./lang";
import { IconChevron, IconExternal, IconSearch } from "./icons";

type Filter = "all" | ProjectCategory;

const CHIP: Record<ProjectCategory, string> = {
  commerce: "border-accent-gold/40 text-gold-strong",
  ai: "border-accent-sage/50 text-[#3f5c40]",
  fintech: "border-accent-sky/50 text-[#2f5468]",
  opensource: "border-accent-rose/40 text-rose-strong",
};

export default function ProjectBoard() {
  const { lang } = useLang();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(() => new Set());

  const counts = useMemo(() => {
    const map: Record<Filter, number> = { all: projects.length, commerce: 0, ai: 0, fintech: 0, opensource: 0 };
    for (const project of projects) map[project.category] += 1;
    return map;
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((project) => {
      if (filter !== "all" && project.category !== filter) return false;
      if (!q) return true;
      return projectSearchText(project, lang).includes(q);
    });
  }, [filter, query, lang]);

  const allOpen = visible.length > 0 && visible.every((project) => open.has(project.id));

  const toggle = (id: string) => {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setOpen((current) => {
      const next = new Set(current);
      if (allOpen) visible.forEach((project) => next.delete(project.id));
      else visible.forEach((project) => next.add(project.id));
      return next;
    });
  };

  const pills: { id: Filter; label: string }[] = [
    { id: "all", label: tx(ui.filterAll, lang) },
    ...categoryOrder.map((id) => ({ id, label: tx(ui.categories[id], lang) })),
  ];

  return (
    <section id="projects" className="scroll-mt-24 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionIndex index="01" title={tx(ui.projectsTitle, lang)} />

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={tx(ui.projectsTitle, lang)}>
            {pills.map((pill) => {
              const active = filter === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(pill.id)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "border-gold-strong bg-gold-strong text-white"
                      : "border-accent-gold/30 bg-bg-paper text-text-secondary hover:border-accent-gold/60 hover:text-text-primary"
                  }`}
                >
                  {pill.label}
                  <span className={`ml-1.5 tabular-nums ${active ? "text-white/80" : "text-text-muted"}`}>{counts[pill.id]}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative block min-w-[220px] flex-1">
              <span className="sr-only">{tx(ui.searchLabel, lang)}</span>
              <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={tx(ui.searchPlaceholder, lang)}
                className="w-full rounded-full border border-accent-gold/30 bg-bg-paper py-2 pr-3 pl-9 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-gold-strong"
              />
            </label>
            <button
              type="button"
              onClick={toggleAll}
              className="rounded-full border border-accent-gold/30 px-3 py-2 text-sm text-text-secondary hover:text-text-primary"
            >
              {allOpen ? tx(ui.collapseAll, lang) : tx(ui.expandAll, lang)}
            </button>
          </div>
        </div>

        <p className="mt-4 text-sm text-text-muted">
          <span className="tabular-nums text-text-secondary">{visible.length}</span> {tx(ui.resultCount, lang)}
        </p>

        {visible.length === 0 ? (
          <p className="mt-10 border border-dashed border-accent-gold/40 bg-bg-paper px-6 py-10 text-center text-text-secondary">
            {tx(ui.noResults, lang)}
          </p>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {visible.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                open={open.has(project.id)}
                query={query}
                onToggle={() => toggle(project.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  open,
  query,
  onToggle,
}: {
  project: Project;
  open: boolean;
  query: string;
  onToggle: () => void;
}) {
  const { lang } = useLang();
  const panelId = `project-panel-${project.id}`;

  return (
    <article
      className={`flex flex-col border border-accent-gold/20 bg-bg-paper shadow-paper transition-shadow motion-safe:hover:shadow-paper-hover ${
        project.featured ? "lg:col-span-2" : ""
      }`}
    >
      <div className={`h-1 ${project.featured ? "bg-gold-strong" : "bg-accent-gold/50"}`} />
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex flex-1 flex-col px-5 py-5 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-[11px] tracking-wide ${CHIP[project.category]}`}>
                {tx(ui.categories[project.category], lang)}
              </span>
              {project.featured && (
                <span className="text-[11px] tracking-widest text-gold-strong uppercase">{tx(ui.featured, lang)}</span>
              )}
            </div>
            <h3 className="diary-title mt-3 text-xl leading-snug sm:text-2xl">
              <Highlight text={tx(project.title, lang)} query={query} />
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              {tx(project.org, lang)} · {tx(project.role, lang)}
            </p>
          </div>
          <IconChevron className={`mt-1 size-5 shrink-0 text-text-muted transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          <Highlight text={tx(project.summary, lang)} query={query} />
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.metrics.map((metric) => (
            <span key={metric.zh} className="rounded-full bg-bg-warm px-2.5 py-1 text-xs text-text-primary">
              <Highlight text={tx(metric, lang)} query={query} />
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
          <span className="tabular-nums">{project.period}</span>
          <span>{open ? tx(ui.collapse, lang) : tx(ui.expand, lang)}</span>
        </div>
      </button>

      <div id={panelId} hidden={!open} className="border-t border-accent-gold/15 px-5 py-5">
        <div className="grid gap-6 lg:grid-cols-3">
          <DetailColumn title={tx(ui.context, lang)} items={project.context} />
          <DetailColumn title={tx(ui.actions, lang)} items={project.actions} />
          <DetailColumn title={tx(ui.impact, lang)} items={project.impact} />
        </div>
        {project.links && project.links.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-3">
            {project.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gold-strong underline-offset-4 hover:underline"
              >
                {tx(link.label, lang)}
                <IconExternal className="size-3.5" />
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function DetailColumn({ title, items }: { title: string; items: { zh: string; en: string }[] }) {
  const { lang } = useLang();
  return (
    <div>
      <h4 className="text-xs font-semibold tracking-[0.14em] text-gold-strong uppercase">{title}</h4>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item.zh} className="border-l-2 border-accent-gold/40 pl-3 text-sm leading-relaxed text-text-secondary">
            {tx(item, lang)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "ig")).filter((part) => part !== "");
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={index} className="rounded-sm bg-bg-warm px-0.5 text-inherit">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

export function SectionIndex({ index, title, lede }: { index: string; title: string; lede?: string }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute -top-6 left-0 font-display text-6xl text-accent-gold/25 select-none sm:text-7xl" aria-hidden>
        {index}
      </span>
      <h2 className="diary-title relative text-3xl sm:text-4xl">{title}</h2>
      {lede && <p className="relative mt-3 max-w-3xl text-base leading-relaxed text-text-secondary">{lede}</p>}
    </div>
  );
}
