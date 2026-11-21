"use client";

import { useEffect, useState } from "react";
import { projectCoverSrc, type CareerDocument } from "@/data/career-document";
import DesktopEditor from "./DesktopEditor";
import ImageField from "./ImageField";
import { Pair } from "./fields";

type Tab = "intro" | "images" | "contact" | "experience" | "projects" | "skills" | "desktop" | "governance";

interface HistoryRow {
  id: number;
  kind: "draft" | "published";
  createdAt: string;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "intro", label: "简介" },
  { id: "images", label: "图片" },
  { id: "contact", label: "联系" },
  { id: "experience", label: "经历" },
  { id: "projects", label: "项目" },
  { id: "skills", label: "键帽" },
  { id: "desktop", label: "ZoeOS" },
  { id: "governance", label: "治理" },
];

export default function CareerEditor() {
  const [doc, setDoc] = useState<CareerDocument | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [storage, setStorage] = useState("none");
  const [tab, setTab] = useState<Tab>("intro");
  const [projectId, setProjectId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const response = await fetch("/api/admin/career");
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "无法打开编辑器");
      return;
    }
    setDoc(payload.document);
    setHistory(payload.history || []);
    setStorage(payload.storage);
    setProjectId(payload.document.projects[0]?.id || "");
    setError("");
  };

  useEffect(() => { void load(); }, []);

  const save = async (action: "draft" | "publish") => {
    if (!doc) return;
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/career", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, document: doc }),
    });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(payload.error || "保存失败");
      return;
    }
    setError("");
    setMessage(action === "publish" ? "已发布，公开页会马上更新。" : "草稿已保存。只有你能用预览链接看到它。");
    await load();
  };

  const revert = async (id: number) => {
    setBusy(true);
    const response = await fetch("/api/admin/career", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "revert", id }),
    });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(payload.error || "无法恢复");
      return;
    }
    setMessage("已恢复这一版并发布。");
    await load();
  };

  if (error && !doc) {
    return <p className="px-6 py-10 text-text-secondary">{error}。请用管理员 GitHub 账号登录后再来。</p>;
  }
  if (!doc) return <p className="px-6 py-10 text-text-muted">正在读取内容…</p>;

  const project = doc.projects.find((item) => item.id === projectId) ?? doc.projects[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 text-text-primary">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">作品集与桌面</h1>
          <p className="mt-1 text-sm text-text-muted">中文在左，英文在右。发布后 /portfolio、/desk 和简历会立刻使用这一版。存储：{storage === "neon" ? "Neon Postgres" : storage === "file" ? "本地文件" : "未连接"}。</p>
          <p className="mt-2 text-sm text-text-secondary">换个人照片、桌面壁纸或项目封面，打开「图片」。ZoeOS 的图标和每个窗口正文在「ZoeOS」。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="rounded-full border border-accent-gold/40 px-3 py-1.5 text-sm" href="/portfolio?draft=1" target="_blank" rel="noreferrer">预览草稿</a>
          <button type="button" disabled={busy} onClick={() => save("draft")} className="rounded-full border border-accent-gold/40 px-3 py-1.5 text-sm">保存草稿</button>
          <button type="button" disabled={busy} onClick={() => save("publish")} className="rounded-full bg-gold-strong px-3 py-1.5 text-sm text-white">发布</button>
        </div>
      </header>
      {message && <p className="mt-3 text-sm text-accent-sage">{message}</p>}
      {error && <p className="mt-3 text-sm text-accent-rose">{error}</p>}
      <div className="mt-4 flex gap-2 overflow-x-auto">
        {TABS.map((item) => (
          <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`rounded-full px-3 py-1 text-sm ${tab === item.id ? "bg-gold-strong text-white" : "border border-accent-gold/30"}`}>{item.label}</button>
        ))}
      </div>
      <div className="mt-4 space-y-4 rounded-2xl border border-accent-gold/20 bg-bg-paper p-4">
        {tab === "intro" && (
          <>
            <Pair label="眉题" value={doc.profile.kicker} onChange={(kicker) => setDoc({ ...doc, profile: { ...doc.profile, kicker } })} />
            <Pair label="抬头" value={doc.profile.title} onChange={(title) => setDoc({ ...doc, profile: { ...doc.profile, title } })} />
            <Pair label="关于我" value={doc.profile.summary} onChange={(summary) => setDoc({ ...doc, profile: { ...doc.profile, summary } })} rows={6} />
            <Pair label="技能区标题" value={doc.shellCopy.keyboardTitle} onChange={(keyboardTitle) => setDoc({ ...doc, shellCopy: { ...doc.shellCopy, keyboardTitle } })} rows={2} />
            {doc.heroMetrics.map((metric, index) => (
              <Pair key={metric.label.zh} label={`指标 ${index + 1}`} value={metric.value} onChange={(value) => {
                const heroMetrics = doc.heroMetrics.map((item, itemIndex) => itemIndex === index ? { ...item, value } : item);
                setDoc({ ...doc, heroMetrics });
              }} rows={2} />
            ))}
          </>
        )}
        {tab === "images" && (
          <div data-testid="career-images" className="space-y-4">
            <ImageField
              label="个人照片"
              hint="用于首页、关于我和相册。拖到虚线框里，或点上传 / 更换。恢复默认会回到海边那张。"
              value={doc.portrait}
              fallback="/images/zoe/seaside.webp"
              testId="career-image-portrait"
              onChange={(portrait) => setDoc({ ...doc, portrait })}
            />
            <ImageField
              label="ZoeOS 桌面壁纸"
              hint="铺满 /desk 里的桌面。拖到虚线框里即可更换。"
              value={doc.wallpaper}
              fallback="/images/zoe/wallpaper-seaside-dusk.webp"
              testId="career-image-wallpaper"
              onChange={(wallpaper) => setDoc({ ...doc, wallpaper })}
            />
            <h2 className="text-sm font-semibold">项目封面</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {doc.projects.map((item) => (
                <ImageField
                  key={item.id}
                  label={item.title.zh}
                  hint="作品集卡片上的封面。"
                  value={item.cover}
                  fallback={projectCoverSrc({ id: item.id, cover: "" })}
                  testId={`career-image-cover-${item.id}`}
                  onChange={(cover) => setDoc({ ...doc, projects: doc.projects.map((projectItem) => projectItem.id === item.id ? { ...projectItem, cover } : projectItem) })}
                />
              ))}
            </div>
          </div>
        )}
        {tab === "contact" && (
          <>
            <label className="block text-xs text-text-muted">邮箱
              <input value={doc.profile.email} onChange={(event) => setDoc({ ...doc, profile: { ...doc.profile, email: event.target.value } })} className="mt-1 w-full rounded-lg border border-accent-gold/30 p-2 text-sm" />
            </label>
            <label className="block text-xs text-text-muted">GitHub 链接
              <input value={doc.profile.github} onChange={(event) => setDoc({ ...doc, profile: { ...doc.profile, github: event.target.value } })} className="mt-1 w-full rounded-lg border border-accent-gold/30 p-2 text-sm" />
            </label>
            <Pair label="城市" value={doc.profile.location} onChange={(location) => setDoc({ ...doc, profile: { ...doc.profile, location } })} rows={2} />
          </>
        )}
        {tab === "experience" && doc.experience.map((role) => (
          <section key={role.id} className="space-y-2 border-b border-accent-gold/15 pb-4">
            <Pair label="公司" value={role.company} onChange={(company) => setDoc({ ...doc, experience: doc.experience.map((item) => item.id === role.id ? { ...item, company } : item) })} rows={2} />
            <Pair label="职位" value={role.role} onChange={(next) => setDoc({ ...doc, experience: doc.experience.map((item) => item.id === role.id ? { ...item, role: next } : item) })} rows={2} />
            <Pair label="摘要" value={role.summary} onChange={(summary) => setDoc({ ...doc, experience: doc.experience.map((item) => item.id === role.id ? { ...item, summary } : item) })} />
          </section>
        ))}
        {tab === "projects" && project && (
          <>
            <select value={project.id} onChange={(event) => setProjectId(event.target.value)} className="rounded-lg border border-accent-gold/30 p-2 text-sm">
              {doc.projects.map((item) => <option key={item.id} value={item.id}>{item.title.zh}</option>)}
            </select>
            <ImageField
              label="项目封面"
              hint="拖到虚线框，或点上传 / 更换。恢复默认回到内置插图。"
              value={project.cover}
              fallback={projectCoverSrc({ id: project.id, cover: "" })}
              testId={`career-image-cover-project-${project.id}`}
              onChange={(cover) => setDoc({ ...doc, projects: doc.projects.map((item) => item.id === project.id ? { ...item, cover } : item) })}
            />
            <Pair label="标题" value={project.title} onChange={(title) => setDoc({ ...doc, projects: doc.projects.map((item) => item.id === project.id ? { ...item, title } : item) })} rows={2} />
            <Pair label="摘要" value={project.summary} onChange={(summary) => setDoc({ ...doc, projects: doc.projects.map((item) => item.id === project.id ? { ...item, summary } : item) })} />
            <Pair label="标签" value={project.domain} onChange={(domain) => setDoc({ ...doc, projects: doc.projects.map((item) => item.id === project.id ? { ...item, domain } : item) })} rows={2} />
            <label className="block text-xs text-text-muted">链接
              <input value={project.links?.[0]?.href || ""} onChange={(event) => {
                const href = event.target.value;
                const links = href ? [{ href, label: project.links?.[0]?.label || { zh: "链接", en: "Link" } }] : [];
                setDoc({ ...doc, projects: doc.projects.map((item) => item.id === project.id ? { ...item, links } : item) });
              }} className="mt-1 w-full rounded-lg border border-accent-gold/30 p-2 text-sm" />
            </label>
          </>
        )}
        {tab === "skills" && doc.keyboardSkills.map((skill) => (
          <section key={skill.id} className="grid gap-2 border-b border-accent-gold/15 pb-3 sm:grid-cols-[8rem_1fr]">
            <label className="text-xs text-text-muted">键帽
              <input value={skill.legend} onChange={(event) => setDoc({ ...doc, keyboardSkills: doc.keyboardSkills.map((item) => item.id === skill.id ? { ...item, legend: event.target.value } : item) })} className="mt-1 w-full rounded-lg border border-accent-gold/30 p-2 text-sm" />
            </label>
            <Pair label={skill.id} value={skill.proof} onChange={(proof) => setDoc({ ...doc, keyboardSkills: doc.keyboardSkills.map((item) => item.id === skill.id ? { ...item, proof } : item) })} rows={2} />
          </section>
        ))}
        {tab === "desktop" && <DesktopEditor doc={doc} setDoc={setDoc} />}
        {tab === "governance" && (
          <>
            <p className="text-xs text-text-muted">四个标签里的步骤和卡片在「ZoeOS」里改，这里改总标题。</p>
            <Pair label="总标题" value={doc.governance.title} onChange={(title) => setDoc({ ...doc, governance: { ...doc.governance, title } })} rows={2} />
            <Pair label="导语" value={doc.governance.lede} onChange={(lede) => setDoc({ ...doc, governance: { ...doc.governance, lede } })} />
          </>
        )}
      </div>
      <aside className="mt-6">
        <h2 className="text-sm font-semibold">最近的版本</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {history.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3">
              <span>{row.kind === "published" ? "已发布" : "草稿"} · {new Date(row.createdAt).toLocaleString("zh-CN")}</span>
              <button type="button" className="text-gold-strong underline" onClick={() => revert(row.id)}>恢复并发布</button>
            </li>
          ))}
          {history.length === 0 && <li className="text-text-muted">还没有保存过。现在显示的是内置原文。</li>}
        </ul>
      </aside>
    </div>
  );
}
