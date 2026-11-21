"use client";

import { useState, type ReactNode } from "react";
import { projectCoverSrc, visibleDesktop, type CareerDocument, type CareerProject, type DesktopAppId } from "@/data/career-document";
import type { Copy } from "@/data/portfolio-data";
import ImageField from "./ImageField";
import { CopyList, Line, Pair } from "./fields";

const WINDOWS: { id: DesktopAppId; blurb: string }[] = [
  { id: "about", blurb: "关于我窗口：照片、名字、抬头、简介、学历和联系方式。简介与作品集、简历共用。" },
  { id: "photos", blurb: "相册窗口使用同一张个人照片。" },
  { id: "experience", blurb: "工作经历窗口：两段经历的要点，以及学历。这些文字也会出现在简历上。" },
  { id: "projects", blurb: "项目文件夹：筛选名称，以及每个项目在窗口里展示的标题、摘要、举措和成果。" },
  { id: "governance", blurb: "治理窗口的四个标签，和作品集里的治理区共用。" },
  { id: "resume", blurb: "简历窗口里的导语和按钮文字。" },
  { id: "terminal", blurb: "终端开场、help 和未知命令。whoami、skills、projects、audit、contact 读取上面的经历与项目。未知命令里的 {command} 会换成输入的内容。" },
];

export default function DesktopEditor({ doc, setDoc }: { doc: CareerDocument; setDoc: (next: CareerDocument) => void }) {
  const [win, setWin] = useState<DesktopAppId>("about");
  const [projectId, setProjectId] = useState(doc.projects[0]?.id ?? "");
  const sorted = [...doc.desktop].sort((a, b) => a.order - b.order);
  const project = doc.projects.find((item) => item.id === projectId) ?? doc.projects[0];

  const setDesktop = (desktop: CareerDocument["desktop"]) => setDoc({ ...doc, desktop });
  const move = (id: DesktopAppId, direction: -1 | 1) => {
    const index = sorted.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= sorted.length) return;
    const next = sorted.slice();
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    const order = new Map(next.map((app, appIndex) => [app.id, appIndex]));
    setDesktop(doc.desktop.map((app) => ({ ...app, order: order.get(app.id) ?? app.order })));
  };
  const patchApp = (id: DesktopAppId, partial: Partial<CareerDocument["desktop"][number]>) => {
    setDesktop(doc.desktop.map((app) => app.id === id ? { ...app, ...partial } : app));
  };
  const patchProject = (id: string, partial: Partial<CareerProject>) => {
    setDoc({ ...doc, projects: doc.projects.map((item) => item.id === id ? { ...item, ...partial } : item) });
  };

  return (
    <div data-testid="zoeos-editor" className="space-y-4">
      <p className="text-sm text-text-secondary">图标的中英文名称、是否显示、排列顺序，以及每个窗口里的正文。壁纸在上面的图片区也能换。发布后 /desk 和 /desk/os 会马上更新。</p>
      <ImageField
        label="桌面壁纸"
        hint="铺满 ZoeOS 桌面。拖进来即可更换。"
        value={doc.wallpaper}
        fallback="/images/zoe/wallpaper-seaside-dusk.webp"
        testId="career-image-wallpaper"
        onChange={(wallpaper) => setDoc({ ...doc, wallpaper })}
      />
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">桌面图标</h3>
        <p className="text-xs text-text-muted">当前显示 {visibleDesktop(doc.desktop).length} 个。取消「显示」后，图标会从桌面和开始菜单消失。</p>
        {sorted.map((app, index) => (
          <article key={app.id} className="space-y-2 rounded-xl border border-accent-gold/20 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!app.hidden}
                  onChange={(event) => patchApp(app.id, { hidden: !event.target.checked })}
                  aria-label={`${app.title.zh} 显示在桌面`}
                />
                显示在桌面
              </label>
              <div className="flex gap-2">
                <button type="button" disabled={index === 0} onClick={() => move(app.id, -1)} className="rounded-full border border-accent-gold/40 px-3 py-1 text-xs disabled:opacity-40">上移</button>
                <button type="button" disabled={index === sorted.length - 1} onClick={() => move(app.id, 1)} className="rounded-full border border-accent-gold/40 px-3 py-1 text-xs disabled:opacity-40">下移</button>
              </div>
            </div>
            <Pair label={`${app.title.zh} / ${app.title.en}`} value={app.title} rows={2} onChange={(title) => patchApp(app.id, { title })} />
          </article>
        ))}
      </section>
      <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="窗口正文">
        {WINDOWS.map((item) => {
          const app = doc.desktop.find((entry) => entry.id === item.id);
          return (
            <button key={item.id} type="button" role="tab" aria-selected={win === item.id} onClick={() => setWin(item.id)} className={`shrink-0 rounded-full px-3 py-1 text-sm ${win === item.id ? "bg-gold-strong text-white" : "border border-accent-gold/30"}`}>
              {app?.title.zh} · {app?.title.en}
            </button>
          );
        })}
      </div>
      <div className="space-y-3" role="tabpanel">
        <p className="text-xs text-text-muted">{WINDOWS.find((item) => item.id === win)?.blurb}</p>
        {win === "about" && <AboutFields doc={doc} setDoc={setDoc} />}
        {win === "photos" && (
          <ImageField
            label="相册照片"
            hint="与首页肖像、关于我窗口是同一张。"
            value={doc.portrait}
            fallback="/images/zoe/seaside.webp"
            testId="career-image-portrait-photos"
            onChange={(portrait) => setDoc({ ...doc, portrait })}
          />
        )}
        {win === "experience" && <ExperienceFields doc={doc} setDoc={setDoc} />}
        {win === "projects" && project && (
          <>
            <div className="space-y-2">
              {doc.employerFilters.map((filter) => (
                <Pair key={filter.id} label={`文件夹 ${filter.id}`} value={filter.label} rows={2} onChange={(label) => setDoc({
                  ...doc,
                  employerFilters: doc.employerFilters.map((item) => item.id === filter.id ? { ...item, label } : item),
                })} />
              ))}
            </div>
            <select value={project.id} onChange={(event) => setProjectId(event.target.value)} className="rounded-lg border border-accent-gold/30 bg-bg-paper p-2 text-sm" aria-label="选择项目">
              {doc.projects.map((item) => <option key={item.id} value={item.id}>{item.title.zh}</option>)}
            </select>
            <ImageField
              label={`${project.title.zh} 封面`}
              hint="出现在作品集项目卡上。"
              value={project.cover}
              fallback={projectCoverSrc({ id: project.id, cover: "" })}
              testId={`career-image-cover-${project.id}`}
              onChange={(cover) => patchProject(project.id, { cover })}
            />
            <Pair label="标题" value={project.title} rows={2} onChange={(title) => patchProject(project.id, { title })} />
            <Line label="时间" value={project.period} onChange={(period) => patchProject(project.id, { period })} />
            <Pair label="摘要" value={project.summary} onChange={(summary) => patchProject(project.id, { summary })} />
            <CopyList label="关键举措" items={project.actions} onChange={(actions) => patchProject(project.id, { actions })} />
            <CopyList label="量化成果" items={project.impact} onChange={(impact) => patchProject(project.id, { impact })} />
          </>
        )}
        {win === "governance" && <GovernanceFields doc={doc} setDoc={setDoc} />}
        {win === "resume" && (
          <>
            <Pair label="窗口里的简介" value={doc.profile.summary} onChange={(summary) => setDoc({ ...doc, profile: { ...doc.profile, summary } })} rows={6} />
            <Pair label="项目入口" value={doc.shellCopy.projectsTitle} rows={2} onChange={(projectsTitle) => setDoc({ ...doc, shellCopy: { ...doc.shellCopy, projectsTitle } })} />
            <Pair label="打开简历按钮" value={doc.shellCopy.modes.resume} rows={2} onChange={(resume) => setDoc({ ...doc, shellCopy: { ...doc.shellCopy, modes: { ...doc.shellCopy.modes, resume } } })} />
          </>
        )}
        {win === "terminal" && (
          <>
            <Pair label="开场第一行" value={doc.terminal.banner} rows={2} onChange={(banner) => setDoc({ ...doc, terminal: { ...doc.terminal, banner } })} />
            <Pair label="开场第二行" value={doc.terminal.startup} rows={2} onChange={(startup) => setDoc({ ...doc, terminal: { ...doc.terminal, startup } })} />
            <Pair label="help 命令" value={doc.terminal.help} onChange={(help) => setDoc({ ...doc, terminal: { ...doc.terminal, help } })} />
            <Pair label="未知命令" value={doc.terminal.unknown} onChange={(unknown) => setDoc({ ...doc, terminal: { ...doc.terminal, unknown } })} />
          </>
        )}
      </div>
    </div>
  );
}

function AboutFields({ doc, setDoc }: { doc: CareerDocument; setDoc: (next: CareerDocument) => void }) {
  const setProfile = (partial: Partial<CareerDocument["profile"]>) => setDoc({ ...doc, profile: { ...doc.profile, ...partial } });
  return (
    <>
      <ImageField
        label="个人照片"
        hint="首页、关于我和相册共用。拖进来即可更换。"
        value={doc.portrait}
        fallback="/images/zoe/seaside.webp"
        testId="career-image-portrait"
        onChange={(portrait) => setDoc({ ...doc, portrait })}
      />
      <Pair label="姓名" value={doc.profile.name} rows={2} onChange={(name) => setProfile({ name })} />
      <Line label="英文名" value={doc.profile.nameEn} onChange={(nameEn) => setProfile({ nameEn })} />
      <Line label="中文名" value={doc.profile.nameZh} onChange={(nameZh) => setProfile({ nameZh })} />
      <Line label="昵称" value={doc.profile.aka} onChange={(aka) => setProfile({ aka })} />
      <Pair label="抬头" value={doc.profile.title} rows={2} onChange={(title) => setProfile({ title })} />
      <Pair label="简介" value={doc.profile.summary} rows={6} onChange={(summary) => setProfile({ summary })} />
      <Pair label="学历说明" value={doc.education.detail} onChange={(detail) => setDoc({ ...doc, education: { ...doc.education, detail } })} />
      <Line label="邮箱" value={doc.profile.email} onChange={(email) => setProfile({ email })} />
      <Line label="GitHub" value={doc.profile.github} onChange={(github) => setProfile({ github })} />
      <Pair label="城市" value={doc.profile.location} rows={2} onChange={(location) => setProfile({ location })} />
      {doc.credentials.map((item, index) => (
        <div key={`credential-${index}`} className="space-y-2 border-t border-accent-gold/15 pt-3">
          <Pair label={`证书 ${index + 1} 标题`} value={item.title} rows={2} onChange={(title) => setCredential(doc, setDoc, index, { title })} />
          <Pair label={`证书 ${index + 1} 说明`} value={item.detail} onChange={(detail) => setCredential(doc, setDoc, index, { detail })} />
        </div>
      ))}
    </>
  );
}

function setCredential(doc: CareerDocument, setDoc: (next: CareerDocument) => void, index: number, partial: { title?: Copy; detail?: Copy }) {
  setDoc({
    ...doc,
    credentials: doc.credentials.map((item, itemIndex) => itemIndex === index ? { ...item, ...partial } : item),
  });
}

function ExperienceFields({ doc, setDoc }: { doc: CareerDocument; setDoc: (next: CareerDocument) => void }) {
  return (
    <>
      {doc.experience.map((role) => (
        <section key={role.id} className="space-y-2 border-b border-accent-gold/15 pb-4">
          <Pair label="公司" value={role.company} rows={2} onChange={(company) => patchRole(doc, setDoc, role.id, { company })} />
          <Pair label="部门" value={role.unit} rows={2} onChange={(unit) => patchRole(doc, setDoc, role.id, { unit })} />
          <Pair label="职位" value={role.role} rows={2} onChange={(next) => patchRole(doc, setDoc, role.id, { role: next })} />
          <Line label="时间" value={role.period} onChange={(period) => patchRole(doc, setDoc, role.id, { period })} />
          <Pair label="摘要" value={role.summary} onChange={(summary) => patchRole(doc, setDoc, role.id, { summary })} />
          <CopyList label="要点" items={role.highlights} onChange={(highlights) => patchRole(doc, setDoc, role.id, { highlights })} />
        </section>
      ))}
      <Pair label="学校" value={doc.education.school} rows={2} onChange={(school) => setDoc({ ...doc, education: { ...doc.education, school } })} />
      <Pair label="学位" value={doc.education.degree} rows={2} onChange={(degree) => setDoc({ ...doc, education: { ...doc.education, degree } })} />
      <Line label="在读时间" value={doc.education.period} onChange={(period) => setDoc({ ...doc, education: { ...doc.education, period } })} />
      <Pair label="学历说明" value={doc.education.detail} onChange={(detail) => setDoc({ ...doc, education: { ...doc.education, detail } })} />
    </>
  );
}

function patchRole(doc: CareerDocument, setDoc: (next: CareerDocument) => void, id: string, partial: Partial<CareerDocument["experience"][number]>) {
  setDoc({ ...doc, experience: doc.experience.map((item) => item.id === id ? { ...item, ...partial } : item) });
}

function GovernanceFields({ doc, setDoc }: { doc: CareerDocument; setDoc: (next: CareerDocument) => void }) {
  const gov = doc.governance;
  const setGov = (next: CareerDocument["governance"]) => setDoc({ ...doc, governance: next });
  return (
    <>
      <Pair label="总眉题" value={gov.eyebrow} rows={2} onChange={(eyebrow) => setGov({ ...gov, eyebrow })} />
      <Pair label="总标题" value={gov.title} rows={2} onChange={(title) => setGov({ ...gov, title })} />
      <Pair label="总导语" value={gov.lede} onChange={(lede) => setGov({ ...gov, lede })} />
      <Block title="质量门禁">
        <Pair label="标题" value={gov.gates.title} rows={2} onChange={(title) => setGov({ ...gov, gates: { ...gov.gates, title } })} />
        <Pair label="地点" value={gov.gates.where} rows={2} onChange={(where) => setGov({ ...gov, gates: { ...gov.gates, where } })} />
        <Pair label="导语" value={gov.gates.lede} onChange={(lede) => setGov({ ...gov, gates: { ...gov.gates, lede } })} />
        {gov.gates.stages.map((stage, index) => (
          <div key={`gate-${index}`} className="space-y-2">
            <Pair label={`步骤 ${index + 1} 标题`} value={stage.title} rows={2} onChange={(title) => {
              const stages = gov.gates.stages.map((item, itemIndex) => itemIndex === index ? { ...item, title } : item);
              setGov({ ...gov, gates: { ...gov.gates, stages } });
            }} />
            <Pair label={`步骤 ${index + 1} 说明`} value={stage.detail} onChange={(detail) => {
              const stages = gov.gates.stages.map((item, itemIndex) => itemIndex === index ? { ...item, detail } : item);
              setGov({ ...gov, gates: { ...gov.gates, stages } });
            }} />
          </div>
        ))}
        {gov.gates.signals.map((signal, index) => (
          <div key={`signal-${index}`} className="space-y-2">
            <Pair label={`指标 ${index + 1} 数字`} value={signal.value} rows={2} onChange={(value) => {
              const signals = gov.gates.signals.map((item, itemIndex) => itemIndex === index ? { ...item, value } : item);
              setGov({ ...gov, gates: { ...gov.gates, signals } });
            }} />
            <Pair label={`指标 ${index + 1} 说明`} value={signal.label} rows={2} onChange={(label) => {
              const signals = gov.gates.signals.map((item, itemIndex) => itemIndex === index ? { ...item, label } : item);
              setGov({ ...gov, gates: { ...gov.gates, signals } });
            }} />
          </div>
        ))}
        <Pair label="看板说明" value={gov.gates.board} onChange={(board) => setGov({ ...gov, gates: { ...gov.gates, board } })} />
      </Block>
      <Block title="规范">
        <Pair label="标题" value={gov.standards.title} rows={2} onChange={(title) => setGov({ ...gov, standards: { ...gov.standards, title } })} />
        <Pair label="地点" value={gov.standards.where} rows={2} onChange={(where) => setGov({ ...gov, standards: { ...gov.standards, where } })} />
        <Pair label="导语" value={gov.standards.lede} onChange={(lede) => setGov({ ...gov, standards: { ...gov.standards, lede } })} />
        {gov.standards.cards.map((card, index) => (
          <div key={`std-${index}`} className="space-y-2">
            <Pair label={`卡片 ${index + 1} 标题`} value={card.title} rows={2} onChange={(title) => {
              const cards = gov.standards.cards.map((item, itemIndex) => itemIndex === index ? { ...item, title } : item);
              setGov({ ...gov, standards: { ...gov.standards, cards } });
            }} />
            <Pair label={`卡片 ${index + 1} 说明`} value={card.detail} onChange={(detail) => {
              const cards = gov.standards.cards.map((item, itemIndex) => itemIndex === index ? { ...item, detail } : item);
              setGov({ ...gov, standards: { ...gov.standards, cards } });
            }} />
          </div>
        ))}
        <Pair label="补充" value={gov.standards.also} onChange={(also) => setGov({ ...gov, standards: { ...gov.standards, also } })} />
      </Block>
      <Block title="风险">
        <Pair label="标题" value={gov.risk.title} rows={2} onChange={(title) => setGov({ ...gov, risk: { ...gov.risk, title } })} />
        <Pair label="地点" value={gov.risk.where} rows={2} onChange={(where) => setGov({ ...gov, risk: { ...gov.risk, where } })} />
        <Pair label="导语" value={gov.risk.lede} onChange={(lede) => setGov({ ...gov, risk: { ...gov.risk, lede } })} />
        {gov.risk.cards.map((card, index) => (
          <div key={`risk-${index}`} className="space-y-2">
            <Pair label={`卡片 ${index + 1} 标题`} value={card.title} rows={2} onChange={(title) => {
              const cards = gov.risk.cards.map((item, itemIndex) => itemIndex === index ? { ...item, title } : item);
              setGov({ ...gov, risk: { ...gov.risk, cards } });
            }} />
            <Pair label={`卡片 ${index + 1} 说明`} value={card.detail} onChange={(detail) => {
              const cards = gov.risk.cards.map((item, itemIndex) => itemIndex === index ? { ...item, detail } : item);
              setGov({ ...gov, risk: { ...gov.risk, cards } });
            }} />
          </div>
        ))}
      </Block>
      <Block title="外部审计">
        <Pair label="标题" value={gov.audit.title} rows={2} onChange={(title) => setGov({ ...gov, audit: { ...gov.audit, title } })} />
        <Pair label="地点" value={gov.audit.where} rows={2} onChange={(where) => setGov({ ...gov, audit: { ...gov.audit, where } })} />
        <Pair label="导语" value={gov.audit.lede} onChange={(lede) => setGov({ ...gov, audit: { ...gov.audit, lede } })} />
        {gov.audit.stages.map((stage, index) => (
          <div key={`audit-${index}`} className="space-y-2">
            <Pair label={`步骤 ${index + 1} 标题`} value={stage.title} rows={2} onChange={(title) => {
              const stages = gov.audit.stages.map((item, itemIndex) => itemIndex === index ? { ...item, title } : item);
              setGov({ ...gov, audit: { ...gov.audit, stages } });
            }} />
            <Pair label={`步骤 ${index + 1} 说明`} value={stage.detail} onChange={(detail) => {
              const stages = gov.audit.stages.map((item, itemIndex) => itemIndex === index ? { ...item, detail } : item);
              setGov({ ...gov, audit: { ...gov.audit, stages } });
            }} />
          </div>
        ))}
        <Pair label="备注" value={gov.audit.note} onChange={(note) => setGov({ ...gov, audit: { ...gov.audit, note } })} />
      </Block>
    </>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details open className="space-y-2 rounded-xl border border-accent-gold/20 p-3">
      <summary className="cursor-pointer text-sm font-semibold">{title}</summary>
      <div className="mt-3 space-y-2">{children}</div>
    </details>
  );
}
