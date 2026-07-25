import { blogPosts } from "@/data/blog-posts";
import BlogList from "@/components/blog/BlogList";

export const metadata = {
  title: "Blog — 我们的时光",
  description: "记录生活与技术的点滴",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6">
        <header className="mb-12 text-center">
          <h1 className="diary-title text-3xl sm:text-4xl">Blog</h1>
          <p className="caption-text mt-3">记录生活与技术的点滴</p>
        </header>
        <BlogList posts={blogPosts} />
      </div>
    </div>
  );
}
