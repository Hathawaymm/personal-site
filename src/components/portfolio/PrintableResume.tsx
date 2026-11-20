"use client";

import Link from "next/link";
import {
  credentials,
  education,
  experience,
  profile,
  projects,
  shellCopy,
  skillGroups,
  tx,
  ui,
  type EmployerId,
} from "@/data/portfolio-data";
import { useLang } from "./lang";
import { contactItems } from "./CareerHeader";

const GROUPS: EmployerId[] = ["root", "bank", "personal"];

export default function PrintableResume({ screen }: { screen?: boolean }) {
  const { lang } = useLang();
  const contacts = contactItems(lang);

  return (
    <div className={screen ? undefined : "career-print-only"}>
      {screen && (
        <p className="career-no-print mx-auto max-w-3xl px-4 pt-8 text-sm text-text-secondary sm:px-0">
          {tx(ui.resumeIntro, lang)}{" "}
          <Link href="/portfolio" className="text-gold-strong underline-offset-4 hover:underline">
            {tx(shellCopy.modes.portfolio, lang)}
          </Link>
          {" · "}
          <Link href="/desk" className="text-gold-strong underline-offset-4 hover:underline">
            {tx(shellCopy.modes.desk, lang)}
          </Link>
        </p>
      )}
      <article className="mx-auto max-w-3xl px-4 py-8 text-[15px] leading-7 text-text-primary sm:px-6 print:max-w-none print:px-0 print:py-0 print:text-[12px] print:leading-snug">
        <header className="border-b border-text-primary/20 pb-4">
          <h1 className="font-display text-4xl leading-none print:text-3xl">{tx(profile.name, lang)}</h1>
          <p className="mt-2 text-base text-text-secondary print:text-sm">{tx(profile.title, lang)}</p>
          <ul className="mt-3 flex flex-col gap-1 text-sm sm:flex-row sm:flex-wrap sm:gap-x-5 print:flex-row print:gap-x-5 print:text-[12px]">
            {contacts.map((item) => (
              <li key={item.key}>
                <span className="text-text-muted">{item.label} </span>
                {item.href ? (
                  <a href={item.href} className="text-text-primary">
                    {item.value}
                  </a>
                ) : (
                  <span>{item.value}</span>
                )}
              </li>
            ))}
          </ul>
        </header>

        <section className="print-block mt-5">
          <h2 className="font-display text-lg">{lang === "zh" ? "简介" : "Summary"}</h2>
          <p className="mt-2 text-text-secondary">{tx(profile.summary, lang)}</p>
        </section>

        <section className="mt-5">
          <h2 className="font-display text-lg">{tx(ui.experienceTitle, lang)}</h2>
          {experience.map((role) => (
            <div key={role.id} className="print-block mt-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="font-semibold">{tx(role.role, lang)} · {tx(role.company, lang)}</h3>
                <p className="text-text-muted tabular-nums">{role.period}</p>
              </div>
              <p className="text-text-muted">{tx(role.unit, lang)}</p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-text-secondary">
                {role.highlights.map((item) => (
                  <li key={item.zh}>{tx(item, lang)}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-5">
          <h2 className="font-display text-lg">{tx(ui.resumeProjectsTitle, lang)}</h2>
          {GROUPS.map((employer) => (
            <div key={employer} className="mt-3">
              <h3 className="text-sm font-semibold tracking-wide text-gold-strong print:text-text-primary">{tx(ui.employers[employer], lang)}</h3>
              <ul className="mt-2 space-y-3">
                {projects
                  .filter((project) => project.employer === employer)
                  .map((project) => (
                    <li key={project.id} className="print-block">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <h4 className="font-semibold text-text-primary">{tx(project.title, lang)}</h4>
                        <span className="text-text-muted tabular-nums">{project.period}</span>
                      </div>
                      <p className="text-text-secondary">{tx(project.resumeLine, lang)}</p>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="print-block mt-5">
          <h2 className="font-display text-lg">{tx(ui.governanceTitle, lang)}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-text-secondary">
            <li>
              {tx(governanceLine.gates, lang)}
            </li>
            <li>{tx(governanceLine.standards, lang)}</li>
            <li>{tx(governanceLine.risk, lang)}</li>
            <li>{tx(governanceLine.audit, lang)}</li>
          </ul>
        </section>

        <section className="print-block mt-5">
          <h2 className="font-display text-lg">{tx(ui.educationTitle, lang)}</h2>
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className="font-semibold">{tx(education.school, lang)} · {tx(education.degree, lang)}</h3>
            <p className="text-text-muted tabular-nums">{education.period}</p>
          </div>
          <p className="mt-1 text-text-secondary">{tx(education.detail, lang)}</p>
        </section>

        <section className="print-block mt-5">
          <h2 className="font-display text-lg">{tx(ui.credentialsTitle, lang)}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-text-secondary">
            {credentials.map((item) => (
              <li key={item.title.zh}>
                <span className="font-medium text-text-primary">{tx(item.title, lang)}. </span>
                {tx(item.detail, lang)}
              </li>
            ))}
          </ul>
        </section>

        <section className="print-block mt-5">
          <h2 className="font-display text-lg">{tx(ui.skillsTitle, lang)}</h2>
          {skillGroups.map((group) => (
            <p key={group.id} className="mt-1 text-text-secondary">
              <span className="font-medium text-text-primary">{tx(group.title, lang)}: </span>
              {group.items.map((item) => tx(item, lang)).join(lang === "zh" ? "、" : ", ")}
            </p>
          ))}
        </section>
      </article>
    </div>
  );
}

const governanceLine = {
  gates: {
    zh: "路特创新：需求评审 → 技术评审 → 提测主流程走查 → 分级发布与复盘。飞书多维表格监控、自动周报与超期预警。核心版本按期交付率 100%，上线缺陷率 < 5%。",
    en: "Root Innovation: requirements review → technical review → main-path walkthrough before test → staged release and retro. Feishu Bitable monitoring, automated weekly reports, overdue alerts. Core releases 100% on time; post-release defect rate < 5%.",
  },
  standards: {
    zh: "规范沉淀：全行《代码质量管理办法》（100+ 系统）、《合作方接入预评估清单》与商户画像、《RPA 需求 SOP》、《生物特征识别算法评测规范》（CN118135636A）。",
    en: "Standards: bank-wide Code Quality Management Measures (100+ systems), partner pre-assessment checklist and merchant profiles, RPA Demand SOP, Biometric Algorithm Evaluation Standard (CN118135636A).",
  },
  risk: {
    zh: "变更控盘：CRM 按 P0/P1/P2 追踪 82 项问题；大促 24 小时值班与扩容降级预案；住建委变更同步表，弹性资源池 3 名备用开发 + 2 名测试。",
    en: "Change control: CRM tracked 82 issues at P0/P1/P2; peak-season 24-hour on-call with scale and degrade plans; housing-escrow change log and a pool of 3 reserve developers + 2 testers.",
  },
  audit: {
    zh: "重庆农商行每年配合外部审计：口径对齐 → 跨系统取数与多方复核 → 差异排查与证据链归档 → 合规报告按期报送。",
    en: "Yearly external-audit support at the bank: align definitions → cross-system extracts and multi-party review → resolve breaks and archive evidence → file the compliance report on time.",
  },
};
