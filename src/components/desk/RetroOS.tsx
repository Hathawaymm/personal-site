"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import {
  credentials,
  education,
  employerFilters,
  experience,
  governance,
  profile,
  projects,
  shellCopy,
  tx,
  ui,
  type EmployerId,
  type Project,
} from "@/data/portfolio-data";
import { useLang } from "../portfolio/lang";
import { playDeskKey, playDeskMouse, releaseDeskKey, unlockDeskAudio } from "./desk-audio";
import { AboutIcon, ExperienceIcon, GovernanceIcon, PhotosIcon, ProjectsIcon, ResumeIcon, TerminalIcon } from "./pixel-icons";
import { runCommand } from "./terminal";

type WinId = "about" | "photos" | "experience" | "projects" | "governance" | "resume" | "terminal";

interface WinState {
  id: WinId;
  x: number;
  y: number;
  z: number;
  open: boolean;
  minimized: boolean;
  maximized: boolean;
}

const APP_ICON: Record<WinId, () => ReactNode> = {
  about: AboutIcon,
  photos: PhotosIcon,
  experience: ExperienceIcon,
  projects: ProjectsIcon,
  governance: GovernanceIcon,
  resume: ResumeIcon,
  terminal: TerminalIcon,
};

const APPS: { id: WinId; title: { zh: string; en: string }; x: number; y: number }[] = [
  { id: "about", title: { zh: "关于我", en: "About_Me.exe" }, x: 36, y: 150 },
  { id: "photos", title: { zh: "个人相册", en: "Photos.exe" }, x: 250, y: 168 },
  { id: "experience", title: { zh: "工作经历", en: "Experience.doc" }, x: 520, y: 150 },
  { id: "projects", title: { zh: "项目作品集 (16)", en: "Projects/" }, x: 80, y: 210 },
  { id: "governance", title: { zh: "流程体系与外部审计", en: "Governance_Audit.sys" }, x: 430, y: 200 },
  { id: "resume", title: { zh: "正式简历", en: "Resume.pdf" }, x: 300, y: 160 },
  { id: "terminal", title: { zh: "终端", en: "Terminal.exe" }, x: 240, y: 240 },
];

export default function RetroOS({ onBack, fill = false }: { onBack: () => void; fill?: boolean }) {
  const { lang, setLang } = useLang();
  const [wins, setWins] = useState<WinState[]>(() => APPS.map((app, index) => ({
    id: app.id,
    x: app.x,
    y: app.y,
    z: index + 1,
    open: false,
    minimized: false,
    maximized: false,
  })));
  const [zTop, setZTop] = useState(APPS.length + 1);
  const [startOpen, setStartOpen] = useState(false);
  const [clock, setClock] = useState("");
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const embedded = window.parent !== window;
    const emit = (kind: string, extra: Record<string, unknown> = {}) => {
      if (embedded) {
        window.parent.postMessage({ type: "desk-sound", kind, ...extra }, window.location.origin);
        return;
      }
      unlockDeskAudio();
      if (kind === "mouse-down") playDeskMouse(true);
      if (kind === "mouse-up") playDeskMouse(false);
      if (kind === "keydown") playDeskKey(String(extra.key ?? ""), Boolean(extra.repeat));
      if (kind === "keyup") releaseDeskKey();
    };
    const down = (event: PointerEvent) => { if (event.button === 0) emit("mouse-down"); };
    const up = (event: PointerEvent) => { if (event.button === 0) emit("mouse-up"); };
    const keyDown = (event: KeyboardEvent) => emit("keydown", { key: event.key, repeat: event.repeat });
    const keyUp = () => emit("keyup");
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString(lang === "zh" ? "zh-CN" : "en-GB", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 30000);
    const media = window.matchMedia("(max-width: 760px)");
    const apply = () => setNarrow(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => {
      window.clearInterval(id);
      media.removeEventListener("change", apply);
    };
  }, [lang]);

  const focus = (id: WinId) => {
    const next = zTop + 1;
    setZTop(next);
    setWins((current) => current.map((win) => win.id === id ? { ...win, open: true, minimized: false, z: next } : win));
    setStartOpen(false);
  };

  const patch = (id: WinId, partial: Partial<WinState>) => {
    setWins((current) => current.map((win) => win.id === id ? { ...win, ...partial } : win));
  };

  const ordered = useMemo(() => [...wins].sort((a, b) => a.z - b.z), [wins]);

  return (
    <div className={`relative overflow-hidden bg-[#1a2744] ${fill ? "h-dvh" : "min-h-[calc(100dvh-52px)]"}`}>
      <img
        src="/images/zoe/wallpaper-seaside-dusk.webp"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="relative z-10 grid grid-cols-3 gap-4 p-4 sm:grid-cols-6">
        {APPS.map((app) => (
          <button key={app.id} type="button" onClick={() => focus(app.id)} className="flex w-28 flex-col items-center gap-1 text-center text-xs font-medium leading-tight text-white" style={{ textShadow: "0 1px 0 #1c140c, 1px 0 0 #1c140c, -1px 0 0 #1c140c, 0 -1px 0 #1c140c, 1px 1px 2px rgba(0,0,0,0.85)" }}>
            <span className="flex size-10 items-center justify-center border-2 border-white/70 bg-[#efe6d4] shadow-[2px_2px_0_#1c140c]">{APP_ICON[app.id]()}</span>
            {tx(app.title, lang)}
          </button>
        ))}
      </div>
      {ordered.filter((win) => win.open && !win.minimized).map((win) => {
        const app = APPS.find((item) => item.id === win.id);
        if (!app) return null;
        return (
          <WindowFrame
            key={win.id}
            title={tx(app.title, lang)}
            win={win}
            narrow={narrow}
            onFocus={() => focus(win.id)}
            onClose={() => patch(win.id, { open: false })}
            onMin={() => patch(win.id, { minimized: true })}
            onMax={() => patch(win.id, { maximized: !win.maximized })}
            onMove={(x, y) => patch(win.id, { x, y })}
          >
            <WindowBody id={win.id} onOpenProject={() => focus("projects")} />
          </WindowFrame>
        );
      })}
      <footer className="absolute inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t-2 border-[#efe6d4] bg-[#cfc6b8] px-2 py-1 text-sm text-[#1c140c]">
        <button type="button" onClick={() => setStartOpen((value) => !value)} className="border-2 border-white bg-[#d9d0c2] px-3 py-1 font-semibold shadow-[2px_2px_0_#1c140c]">
          {tx(shellCopy.osName, lang)}
        </button>
        <div className="flex flex-1 gap-1 overflow-x-auto">
          {wins.filter((win) => win.open).map((win) => {
            const app = APPS.find((item) => item.id === win.id);
            return (
              <button key={win.id} type="button" onClick={() => focus(win.id)} className="shrink-0 border border-[#1c140c]/30 bg-[#efe6d4] px-2 py-1 text-xs">
                {app ? tx(app.title, lang) : win.id}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="border border-[#1c140c]/30 bg-[#efe6d4] px-2 py-1 text-xs">
          {lang === "zh" ? "EN" : "中文"}
        </button>
        <button type="button" onClick={onBack} className="border border-[#1c140c]/30 bg-[#efe6d4] px-2 py-1 text-xs">
          {tx(shellCopy.deskBack, lang)}
        </button>
        <Link href="/portfolio" className="border border-[#1c140c]/30 bg-[#efe6d4] px-2 py-1 text-xs">{tx(shellCopy.modes.portfolio, lang)}</Link>
        <Link href="/resume" className="border border-[#1c140c]/30 bg-[#efe6d4] px-2 py-1 text-xs">PDF</Link>
        <span className="min-w-12 border border-[#1c140c]/20 bg-[#efe6d4] px-2 py-1 text-center text-xs tabular-nums">{clock}</span>
      </footer>
      {startOpen && (
        <div className="absolute bottom-12 left-2 z-40 w-56 border-2 border-[#efe6d4] bg-[#d9d0c2] text-sm text-[#1c140c] shadow-[4px_4px_0_#1c140c]">
          {APPS.map((app) => (
            <button key={app.id} type="button" onClick={() => focus(app.id)} className="block w-full px-3 py-2 text-left hover:bg-[#3c4f7c] hover:text-white">
              {tx(app.title, lang)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function WindowFrame({
  title, win, narrow, children, onFocus, onClose, onMin, onMax, onMove,
}: {
  title: string;
  win: WinState;
  narrow: boolean;
  children: ReactNode;
  onFocus: () => void;
  onClose: () => void;
  onMin: () => void;
  onMax: () => void;
  onMove: (x: number, y: number) => void;
}) {
  const style = narrow || win.maximized
    ? { left: 8, top: 8, width: "calc(100% - 16px)", height: "calc(100% - 64px)", zIndex: win.z }
    : { left: win.x, top: win.y, width: 460, height: 380, zIndex: win.z };

  const drag = (event: ReactPointerEvent) => {
    if (narrow || win.maximized) return;
    onFocus();
    const originX = event.clientX;
    const originY = event.clientY;
    const startX = win.x;
    const startY = win.y;
    const move = (ev: PointerEvent) => onMove(startX + ev.clientX - originX, Math.max(8, startY + ev.clientY - originY));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <section className="absolute flex flex-col border-2 border-[#efe6d4] bg-[#cfc6b8] text-[#1c140c] shadow-[6px_6px_0_rgba(0,0,0,0.35)]" style={style} onPointerDown={onFocus}>
      <header className="flex cursor-grab items-center justify-between bg-[#3c4f7c] px-2 py-1 text-white" onPointerDown={drag}>
        <h2 className="truncate text-sm font-semibold">{title}</h2>
        <div className="flex gap-1">
          <WinButton label="_" onClick={onMin} />
          <WinButton label="□" onClick={onMax} />
          <WinButton label="×" onClick={onClose} />
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto bg-[#f4efe4] p-3 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function WinButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={onClick} className="size-5 bg-[#d9d0c2] text-xs text-[#1c140c]">
      {label}
    </button>
  );
}

function WindowBody({ id, onOpenProject }: { id: WinId; onOpenProject: () => void }) {
  if (id === "about") return <AboutPane />;
  if (id === "photos") return <PhotosPane />;
  if (id === "experience") return <ExperiencePane />;
  if (id === "projects") return <ProjectsPane />;
  if (id === "governance") return <GovernancePane />;
  if (id === "resume") return <ResumePane onOpenProject={onOpenProject} />;
  return <TerminalPane />;
}

function AboutPane() {
  const { lang } = useLang();
  return (
    <div className="space-y-2">
      <img src="/images/zoe/seaside.webp" alt="" className="mb-2 max-h-52 w-full object-contain object-[62%_center]" />
      <h3 className="font-display text-xl">{tx(profile.name, lang)}</h3>
      <p>{tx(profile.title, lang)}</p>
      <p>{tx(profile.summary, lang)}</p>
      <p>{tx(education.detail, lang)}</p>
      <ul>
        <li><a href={`mailto:${profile.email}`}>{profile.email}</a></li>
        <li><a href={profile.github}>{profile.github}</a></li>
        <li>{tx(profile.location, lang)}</li>
      </ul>
      <ul className="list-disc pl-4">
        {credentials.slice(0, 3).map((item) => <li key={item.title.zh}>{tx(item.title, lang)}</li>)}
      </ul>
    </div>
  );
}

function PhotosPane() {
  return (
    <img src="/images/zoe/seaside.webp" alt="Seaside" className="max-h-[320px] w-full object-contain object-[62%_center]" />
  );
}

function ExperiencePane() {
  const { lang } = useLang();
  return (
    <div className="space-y-4">
      {experience.map((role) => (
        <article key={role.id}>
          <h3 className="font-semibold">{tx(role.company, lang)}</h3>
          <p className="text-xs">{tx(role.role, lang)} · {role.period}</p>
          <ul className="mt-1 list-disc pl-4">
            {role.highlights.map((item) => <li key={item.zh}>{tx(item, lang)}</li>)}
          </ul>
        </article>
      ))}
      <article>
        <h3 className="font-semibold">{tx(education.school, lang)}</h3>
        <p>{tx(education.degree, lang)} · {education.period}</p>
      </article>
    </div>
  );
}

function ProjectsPane() {
  const { lang } = useLang();
  const [folder, setFolder] = useState<"all" | EmployerId>("all");
  const [project, setProject] = useState<Project | null>(null);
  const list = projects.filter((item) => folder === "all" || item.employer === folder);
  if (project) {
    return (
      <div>
        <button type="button" onClick={() => setProject(null)} className="mb-2 underline">{tx(ui.collapse, lang)}</button>
        <h3 className="font-semibold">{tx(project.title, lang)}</h3>
        <p className="text-xs">{project.period}</p>
        <p className="mt-2">{tx(project.summary, lang)}</p>
        <ul className="mt-2 list-disc pl-4">
          {project.impact.map((item) => <li key={item.zh}>{tx(item, lang)}</li>)}
        </ul>
        <p className="mt-2 font-semibold">{tx(ui.actions, lang)}</p>
        <ul className="list-disc pl-4">
          {project.actions.map((item) => <li key={item.zh}>{tx(item, lang)}</li>)}
        </ul>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1">
        {employerFilters.map((pill) => (
          <button key={pill.id} type="button" onClick={() => setFolder(pill.id)} className={`border px-2 py-0.5 text-xs ${folder === pill.id ? "bg-[#3c4f7c] text-white" : "bg-white"}`}>
            {tx(pill.label, lang)}
          </button>
        ))}
      </div>
      <ul>
        {list.map((item) => (
          <li key={item.id}>
            <button type="button" className="text-left underline" onClick={() => setProject(item)}>{tx(item.title, lang)}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GovernancePane() {
  const { lang } = useLang();
  const [tab, setTab] = useState<"gates" | "standards" | "risk" | "audit">("audit");
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1">
        {(["gates", "standards", "risk", "audit"] as const).map((id) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`border px-2 py-0.5 text-xs ${tab === id ? "bg-[#3c4f7c] text-white" : "bg-white"}`}>
            {tx(governance[id].title, lang)}
          </button>
        ))}
      </div>
      <p>{tx(governance[tab].lede, lang)}</p>
      {tab === "audit" && (
        <ol className="mt-2 list-decimal pl-4">
          {governance.audit.stages.map((stage) => <li key={stage.title.zh}><strong>{tx(stage.title, lang)}. </strong>{tx(stage.detail, lang)}</li>)}
        </ol>
      )}
      {tab === "gates" && (
        <ol className="mt-2 list-decimal pl-4">
          {governance.gates.stages.map((stage) => <li key={stage.title.zh}>{tx(stage.title, lang)} — {tx(stage.detail, lang)}</li>)}
        </ol>
      )}
      {tab === "standards" && (
        <ul className="mt-2 list-disc pl-4">
          {governance.standards.cards.map((card) => <li key={card.title.zh}><strong>{tx(card.title, lang)}. </strong>{tx(card.detail, lang)}</li>)}
        </ul>
      )}
      {tab === "risk" && (
        <ul className="mt-2 list-disc pl-4">
          {governance.risk.cards.map((card) => <li key={card.title.zh}><strong>{tx(card.title, lang)}. </strong>{tx(card.detail, lang)}</li>)}
        </ul>
      )}
    </div>
  );
}

function ResumePane({ onOpenProject }: { onOpenProject: () => void }) {
  const { lang } = useLang();
  return (
    <div className="space-y-2">
      <p>{tx(profile.summary, lang)}</p>
      <button type="button" onClick={onOpenProject} className="underline">{tx(shellCopy.projectsTitle, lang)}</button>
      <Link href="/resume" className="inline-block border-2 border-[#1c140c] bg-[#e4b15a] px-3 py-1 font-semibold">
        {tx(shellCopy.modes.resume, lang)}
      </Link>
    </div>
  );
}

function TerminalPane() {
  const { lang, setLang } = useLang();
  const [lines, setLines] = useState<string[]>(["ZoeOS 98", "help"]);
  const [value, setValue] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = runCommand(value, lang);
    setValue("");
    if (result.action === "clear") {
      setLines([]);
      return;
    }
    if (result.action === "toggle-lang") setLang(lang === "zh" ? "en" : "zh");
    setLines((current) => [...current, `> ${value}`, ...result.lines]);
  };
  return (
    <div className="flex h-full min-h-48 flex-col bg-[#10241c] p-2 font-mono text-xs text-[#d7ffe0]">
      <div className="flex-1 space-y-1 overflow-auto">
        {lines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}
      </div>
      <form onSubmit={submit} className="mt-2 flex gap-1">
        <span>&gt;</span>
        <input value={value} onChange={(event) => setValue(event.target.value)} className="flex-1 bg-transparent outline-none" aria-label="terminal" autoComplete="off" />
      </form>
    </div>
  );
}
