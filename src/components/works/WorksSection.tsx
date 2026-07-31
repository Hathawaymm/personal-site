"use client";

import { useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { WorkItem, WorkType, WorkCategory } from "@/lib/data";
import { WORK_CATEGORY_LABELS } from "@/lib/data";
import { proxyImageUrl } from "@/lib/image";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface WorksSectionProps {
  works: WorkItem[];
  title?: string;
  subtitle?: string;
}

const TYPE_LABEL: Record<WorkType, string> = {
  image: "图片",
  video: "视频",
  pdf: "PDF",
  text: "写作",
};

const ALL_CATEGORIES: WorkCategory[] = ["video", "writing", "photo", "design"];

function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/^- (.*)$/gm, "<li>$1</li>");
  html = html
    .split("\n").map(l => l.trim() === "" ? "" : l).join("\n");
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, m => `<ul>${m}</ul>`);
  html = html.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br/>");
  return `<p>${html}</p>`;
}

export default function WorksSection({ works, title = "作品集", subtitle = "" }: WorksSectionProps) {
  const [selected, setSelected] = useState<WorkItem | null>(null);
  const [activeCat, setActiveCat] = useState<"all" | WorkCategory>("all");
  const [textContent, setTextContent] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);

  const existingCats = useMemo(() => {
    const set = new Set<WorkCategory>();
    works.forEach(w => { if (w.workCategory) set.add(w.workCategory); });
    return ALL_CATEGORIES.filter(c => set.has(c));
  }, [works]);

  const filteredWorks = useMemo(() => {
    if (activeCat === "all") return works;
    return works.filter(w => w.workCategory === activeCat);
  }, [works, activeCat]);

  if (works.length === 0) return null;

  const proxyFile = (url: string) => `/api/file-proxy?url=${encodeURIComponent(url)}`;

  const openWork = (work: WorkItem) => {
    setSelected(work);
    setTextContent(null);
    setNumPages(0);
    if (work.type === "text" && work.fileUrl) {
      fetch(proxyFile(work.fileUrl)).then(r => r.text()).then(t => setTextContent(renderMarkdown(t))).catch(() => setTextContent("（内容加载失败）"));
    }
  };

  return (
    <section id="works" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="text-center">
          <h2 className="diary-title text-2xl sm:text-3xl">{title}</h2>
          {subtitle && <p className="caption-text mt-2 text-sm">{subtitle}</p>}
        </div>

        {existingCats.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveCat("all")}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${activeCat === "all" ? "bg-accent-gold text-white" : "border border-accent-gold/30 text-accent-gold hover:bg-accent-gold/5"}`}
            >
              全部
            </button>
            {existingCats.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${activeCat === cat ? "bg-accent-gold text-white" : "border border-accent-gold/30 text-accent-gold hover:bg-accent-gold/5"}`}
              >
                {WORK_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {filteredWorks.map((work) => (
            <div
              key={work.title}
              onClick={() => openWork(work)}
              className="cursor-pointer overflow-hidden rounded-lg border border-accent-gold/20 bg-bg-cream/85 shadow-paper backdrop-blur transition-all duration-300 hover:shadow-paper-hover"
            >
              {work.type === "video" && work.videoUrl ? (
                <div className="relative aspect-video w-full bg-bg-warm">
                  <video
                    className="h-full w-full object-cover"
                    src={work.videoUrl}
                    poster={proxyImageUrl(work.cover)}
                    controls
                    preload="metadata"
                    onClick={e => e.stopPropagation()}
                  >
                    您的浏览器不支持视频播放。
                  </video>
                </div>
              ) : work.type === "pdf" || work.type === "text" ? (
                <div className="relative flex aspect-video w-full items-center justify-center bg-bg-warm">
                  {work.cover ? (
                    <img src={proxyImageUrl(work.cover)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-display text-5xl text-accent-gold">{work.type === "pdf" ? "PDF" : "✎"}</span>
                  )}
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs text-white">点击在线阅读</span>
                </div>
              ) : (
                <div className="relative aspect-video w-full bg-bg-warm">
                  {work.cover && <img src={proxyImageUrl(work.cover)} alt="" className="h-full w-full object-cover" />}
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  {work.workCategory && <span className="rounded-full border border-accent-gold/30 px-2 py-0.5 text-xs text-accent-gold">{WORK_CATEGORY_LABELS[work.workCategory]}</span>}
                  {work.type && <span className="rounded-full border border-accent-gold/30 px-2 py-0.5 text-xs text-accent-gold">{TYPE_LABEL[work.type] || "图片"}</span>}
                  {work.category && <span className="rounded-full border border-accent-gold/30 px-2 py-0.5 text-xs text-accent-gold">{work.category}</span>}
                  <h3 className="diary-title text-lg">{work.title}</h3>
                </div>
                {work.description && <p className="text-sm leading-relaxed text-text-muted">{work.description}</p>}
              </div>
            </div>
          ))}
        </div>
        {filteredWorks.length === 0 && <p className="text-center text-text-muted caption-text">该分类下暂无作品</p>}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={() => setSelected(null)}>
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-bg-paper p-6 shadow-paper-hover" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="diary-title text-2xl">{selected.title}</h3>
                {selected.workCategory && (
                  <p className="mt-1 text-sm text-accent-gold">{WORK_CATEGORY_LABELS[selected.workCategory]}</p>
                )}
              </div>
              <button onClick={() => setSelected(null)} className="text-2xl text-text-muted hover:text-text-primary">✕</button>
            </div>

            {selected.type === "video" && selected.videoUrl && (
              <video src={selected.videoUrl} controls className="w-full rounded-lg" autoPlay />
            )}

            {selected.type === "pdf" && selected.fileUrl && (
              <Document file={proxyFile(selected.fileUrl)} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                {Array.from(new Array(numPages), (_, i) => (
                  <Page key={i + 1} pageNumber={i + 1} renderTextLayer={false} renderAnnotationLayer={false} className="mb-4" />
                ))}
              </Document>
            )}

            {selected.type === "text" && (
              <div className="prose prose-stone max-w-none">
                {textContent === null ? (
                  <p className="text-text-muted">加载中...</p>
                ) : textContent.startsWith("<p>") ? (
                  <div className="text-text-secondary leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: textContent }} />
                ) : (
                  <pre className="whitespace-pre-wrap text-sm text-text-secondary">{textContent}</pre>
                )}
              </div>
            )}

            {selected.type === "image" && selected.cover && (
              <img src={proxyImageUrl(selected.cover)} alt={selected.title} className="w-full rounded-lg" />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

