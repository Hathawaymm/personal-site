import Link from "next/link";
import ResumeSection from "@/components/resume/ResumeSection";
import WorksSection from "@/components/works/WorksSection";
import FamilySection from "@/components/family/FamilySection";
import BlogCard from "@/components/blog/BlogCard";
import { blogPosts } from "@/data/blog-posts";

export default function Home() {
  const recentPosts = blogPosts.slice(0, 3);

  return (
    <>
      {/* Title header */}
      <header className="px-4 pt-28 pb-16 text-center sm:pt-36 sm:pb-24">
        <h1 className="diary-title text-3xl sm:text-5xl">欢迎来到我的空间，我的朋友</h1>
        <p className="caption-text mt-4 text-base sm:text-lg">用镜头记录每一个温暖日常</p>
      </header>

      {/* Resume */}
      <ResumeSection />

      {/* Works */}
      <WorksSection />

      {/* Family */}
      <FamilySection />

      {/* Blog preview */}
      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center">
            <h2 className="diary-title text-2xl sm:text-3xl">最近文章</h2>
            <p className="caption-text mt-2 text-sm">记录生活与技术的点滴</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <BlogCard key={post.slug} {...post} />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-accent-gold/50 px-6 py-3 text-sm font-medium text-accent-gold transition-all duration-300 hover:bg-accent-gold/10"
            >
              查看更多文章
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
