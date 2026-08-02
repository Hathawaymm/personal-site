"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { blogPosts as fallbackPosts } from "@/data/blog-posts";
import { fetchBlogPostBySlug, type BlogPostDetail } from "@/lib/blog";
import { useAccessLog } from "@/hooks/useAccessLog";
import { proxyHtmlImages } from "@/lib/image";

export default function BlogDetailPage() {
  useAccessLog("博客");
  const params = useParams();
  const rawSlug = params.slug as string;
  let slug = rawSlug;
  try { slug = decodeURIComponent(rawSlug); } catch { /* 已解码或含非法 % */ }
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    fetchBlogPostBySlug(slug)
      .then(data => {
        if (data) { setPost(data); }
        else {
          const fb = fallbackPosts.find(p => p.slug === slug);
          setPost(fb || null);
        }
      })
      .catch(() => {
        setPost(fallbackPosts.find(p => p.slug === slug) || null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (post && typeof window !== "undefined") {
      try {
        const key = `blog_views_${slug}`;
        const stored = JSON.parse(localStorage.getItem(key) || "null");
        const newCount = (stored?.count || 0) + 1;
        localStorage.setItem(key, JSON.stringify({ count: newCount }));
        setViews(newCount);
      } catch {
        setViews(1);
      }
    }
  }, [slug, post]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <AuthGuard requirePermissions={["blog"]}>
      <div className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {post ? (
            <article>
              <header className="mb-10 text-center">
                <h1 className="diary-title text-3xl sm:text-4xl leading-relaxed">{post.title}</h1>
                <div className="mt-4 flex items-center justify-center gap-3 text-sm text-text-muted">
                  <time dateTime={post.date}>{post.date}</time>
                  <span aria-hidden="true">&middot;</span>
                  <span>{post.readTime}</span>
                  {views !== null && (
                    <>
                      <span aria-hidden="true">&middot;</span>
                      <span>👁 {views + 1} 人看过</span>
                    </>
                  )}
                </div>
              </header>

              <div className="prose prose-stone mx-auto max-w-none">
                {post.content ? (
                  <div className="post-content text-text-secondary leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: proxyHtmlImages(post.content) }} />
                ) : (
                  <p className="text-text-secondary leading-relaxed text-lg">{post.excerpt}</p>
                )}
                {!post.content && (
                  <p className="mt-8 text-text-muted caption-text text-center">（完整内容敬请期待...）</p>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-2 justify-center">
                {post.tags.map(tag => (
                  <span key={tag} className="inline-flex rounded-full border border-accent-gold/30 px-3 py-1 text-sm text-accent-gold">{tag}</span>
                ))}
              </div>

              <div className="mt-16 text-center">
                <Link href="/blog" className="inline-flex items-center gap-2 rounded-full border border-accent-gold/50 px-6 py-3 text-sm font-medium text-accent-gold hover:bg-accent-gold/10">
                  ← 返回博客列表
                </Link>
              </div>
            </article>
          ) : (
            <div className="text-center">
              <h1 className="diary-title text-2xl">文章未找到</h1>
              <Link href="/blog" className="mt-4 inline-block text-accent-gold hover:underline">返回博客列表</Link>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
