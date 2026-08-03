"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePreview, PreviewToggle } from "@/components/dashboard/PreviewToggle";
import Link from "next/link";
import ResumeSection from "@/components/resume/ResumeSection";
import WorksSection from "@/components/works/WorksSection";
import FamilySection from "@/components/family/FamilySection";
import BlogCard from "@/components/blog/BlogCard";
import { blogPosts as fallbackPosts } from "@/data/blog-posts";
import { fetchBlogPosts, type BlogPost } from "@/lib/blog";
import { useEffect, useState } from "react";
import type { ResumeData, WorkItem, FamilyMember, SectionTitles, HomepageConfig, SiteSection } from "@/lib/data";
import { emptyResume } from "@/lib/constants";
import { DEFAULT_SECTIONS, DEFAULT_HOMEPAGE, fetchSections } from "@/lib/data";
import { proxyImageUrl } from "@/lib/image";
import InlineEditor from "@/components/home/InlineEditor";

export default function Home() {
  const { isLoggedIn, isAdmin, status, loading, needsInit, permissions } = useAuth();
  const { previewing } = usePreview();
  const [resume, setResume] = useState<ResumeData>(emptyResume);
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [photos, setPhotos] = useState<{ src: string; alt: string }[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [sections, setSections] = useState<SectionTitles>({ ...DEFAULT_SECTIONS });
  const [homepage, setHomepage] = useState<HomepageConfig>({ ...DEFAULT_HOMEPAGE });
  const [pageSections, setPageSections] = useState<SiteSection[]>([]);

  const canShowResume = isAdmin || permissions.resume_text === true;
  const canShowWorks = isAdmin || permissions.portfolio === true;
  const canShowFamily = isAdmin || permissions.family === true;
  const canShowBlog = isAdmin || permissions.blog === true;

  const hasAnyContent = canShowResume || canShowWorks || canShowFamily || canShowBlog;

  const saveSections = async (data: Record<string, string>) => {
    const current = await fetch("/api/admin/site-data").then(r => r.json());
    current.sections = { ...(current.sections || {}), ...data };
    await fetch("/api/admin/site-data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(current) });
    setSections(prev => ({ ...prev, ...data }));
  };

  useEffect(() => {
    if (hasAnyContent) {
      fetch("/api/site-data").then(r => r.json()).then(d => {
        setResume(d.resume || emptyResume);
        setWorks(d.works || []);
        setFamily(d.family || []);
        setPhotos(d.photos || []);
        setSections({ ...DEFAULT_SECTIONS, ...(d.sections || {}) });
      }).catch((err) => { console.error("加载站点数据失败:", err); });
    }
    if (canShowBlog) {
      fetchBlogPosts()
        .then(data => setRecentPosts(data.slice(0, 3)))
        .catch(() => setRecentPosts(fallbackPosts.slice(0, 3)));
    }
    fetch("/api/config").then(r => r.json()).then(cfg => {
      setHomepage({ ...DEFAULT_HOMEPAGE, ...cfg });
    }).catch(() => {});
    fetchSections().then(s => setPageSections(s)).catch(() => {});
  }, [hasAnyContent, canShowBlog]);

  const showHeroButton = homepage.buttonText && homepage.buttonLink;

  const renderModule = (item: SiteSection) => {
    const key = item.type;
    switch (key) {
      case "works":
        return canShowWorks && works.length > 0 ? (
          <div key={item.id} className="relative">
            {isAdmin && !previewing && (
              <>
                <InlineEditor
                  title="编辑作品区副标题"
                  fields={[
                    { label: "副标题", key: "worksSubtitle", value: sections.worksSubtitle, type: "textarea" },
                  ]}
                  onSave={saveSections}
                />
                <Link href="/dashboard?tab=works" className="absolute top-4 right-28 z-10 rounded-full bg-bg-paper border border-accent-gold/30 px-3 py-1.5 text-xs text-gold-strong shadow-paper hover:bg-gold-strong/5">
                  ✏ 编辑内容
                </Link>
              </>
            )}
            <WorksSection works={works} title={item.name || sections.worksTitle} subtitle={sections.worksSubtitle} />
          </div>
        ) : null;
      case "resume":
        return canShowResume ? (
          <div key={item.id} className="relative">
            {isAdmin && !previewing && (
              <Link href="/dashboard?tab=resume" className="absolute top-4 right-6 z-10 rounded-full bg-bg-paper border border-accent-gold/30 px-3 py-1.5 text-xs text-gold-strong shadow-paper hover:bg-gold-strong/5">
                ✏ 编辑
              </Link>
            )}
            <ResumeSection data={resume} />
          </div>
        ) : null;
      case "family":
        return canShowFamily && family.length > 0 ? (
          <div key={item.id} className="relative">
            {isAdmin && !previewing && (
              <>
                <InlineEditor
                  title="编辑家庭区副标题"
                  fields={[
                    { label: "副标题", key: "familySubtitle", value: sections.familySubtitle, type: "textarea" },
                  ]}
                  onSave={saveSections}
                />
                <Link href="/dashboard?tab=family" className="absolute top-4 right-28 z-10 rounded-full bg-bg-paper border border-accent-gold/30 px-3 py-1.5 text-xs text-gold-strong shadow-paper hover:bg-gold-strong/5">
                  ✏ 编辑内容
                </Link>
              </>
            )}
            <FamilySection members={family} title={item.name || sections.familyTitle} subtitle={sections.familySubtitle} />
          </div>
        ) : null;
      case "blog":
        return canShowBlog ? (
          <section key={item.id} className="relative px-4 py-24 sm:px-6">
            <div className="mx-auto max-w-5xl space-y-12">
              <div className="text-center">
                <h2 className="diary-title text-2xl sm:text-3xl">{item.name || sections.blogTitle}</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recentPosts.map((post) => (<BlogCard key={post.slug} {...post} />))}
              </div>
              <div className="text-center">
                <Link href="/blog" className="inline-flex items-center gap-2 rounded-full border border-accent-gold/50 px-6 py-3 text-sm font-medium text-gold-strong hover:bg-gold-strong/10">
                  查看更多文章
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>
          </section>
        ) : null;
      case "photos":
        return photos.length > 0 ? (
          <section key={item.id} className="px-4 py-24 sm:px-6">
            <div className="mx-auto max-w-5xl">
              <div className="mb-10 text-center">
                <h2 className="diary-title text-2xl sm:text-3xl">{item.name}</h2>
              </div>
              <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
                {photos.slice(0, 10).map((photo, i) => (
                  <div key={i} className="mb-4 break-inside-avoid overflow-hidden rounded-lg">
                    <img src={proxyImageUrl(photo.src)} alt={photo.alt || ""} className="w-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
              {photos.length > 10 && (
                <div className="mt-8 text-center">
                  <Link href="/photos" className="inline-flex items-center gap-2 rounded-full border border-accent-gold/50 px-6 py-3 text-sm font-medium text-gold-strong hover:bg-gold-strong/10">
                    查看全部照片（{photos.length} 张）
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </Link>
                </div>
              )}
            </div>
          </section>
        ) : null;
      case "custom":
        return (
          <section key={item.id} className="px-4 py-24 sm:px-6">
            <div className="mx-auto max-w-5xl text-center">
              <h2 className="diary-title text-2xl sm:text-3xl">{item.name}</h2>
              {item.icon && <div className="mt-4 text-3xl">{item.icon}</div>}
              <p className="mt-4 caption-text text-text-muted">该板块内容待配置</p>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-cream">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent mx-auto" />
      </div>
    );
  }

  if (isLoggedIn && needsInit) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-cream">
        <div className="text-center px-4">
          <h1 className="diary-title text-2xl sm:text-3xl">系统初始化中</h1>
          <p className="mt-4 text-text-muted caption-text">请稍后访问，管理员正在准备中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header
        className="relative flex flex-col items-center justify-center px-4 pt-32 pb-20 text-center sm:pt-40 sm:pb-28"
        style={homepage.heroImage ? { backgroundImage: `url(${proxyImageUrl(homepage.heroImage)})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        {homepage.heroImage && <div className="absolute inset-0 bg-bg-cream/70" />}
        <div className="relative">
          <h1 className="diary-title text-3xl sm:text-5xl">{homepage.heroTitle}</h1>
          {homepage.heroSubtitle && <p className="caption-text mt-4 text-base sm:text-lg">{homepage.heroSubtitle}</p>}
          {showHeroButton && (
            <Link href={homepage.buttonLink} className="mt-8 inline-block rounded-full bg-gold-strong px-8 py-3 text-sm font-medium text-white shadow-lg transition-all hover:scale-105">
              {homepage.buttonText}
            </Link>
          )}
          {!isLoggedIn && !showHeroButton && (
            <Link href="/login" className="mt-6 inline-block rounded-full bg-gold-strong px-6 py-3 text-sm font-medium text-white hover:opacity-90">
              GitHub 登录
            </Link>
          )}
          {isLoggedIn && !isAdmin && status === "pending" && (
            <p className="mt-6 caption-text text-text-muted">
              🏠 管理员还没开门，稍等片刻哦~
            </p>
          )}
        </div>
      </header>

      {pageSections.map(item => renderModule(item))}

      <PreviewToggle />

      {isLoggedIn && (
        <button
          onClick={async () => {
            try {
              const r = await fetch("/api/site-data");
              const d = await r.json();
              const email = d?.settings?.adminEmail || "暂未设置";
              alert(`如有问题请联系管理员：${email}`);
            } catch { alert("暂无法获取管理员联系方式"); }
          }}
          className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-bg-paper border border-accent-gold/30 text-gold-strong text-lg shadow-paper hover:shadow-paper-hover transition-all"
          title="帮助"
        >
          ❓
        </button>
      )}

      {isAdmin && !previewing && (
        <Link
          href="/dashboard"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gold-strong px-5 py-3 text-sm font-medium text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          编辑网站
        </Link>
      )}
    </>
  );
}
