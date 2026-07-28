"use client";

import { blogPosts as fallbackPosts } from "@/data/blog-posts";
import BlogList from "@/components/blog/BlogList";
import { useEffect, useState } from "react";
import type { BlogPost } from "@/lib/blog";
import { fetchBlogPosts } from "@/lib/blog";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts()
      .then(data => setPosts(data.length > 0 ? data : fallbackPosts))
      .catch(() => setPosts(fallbackPosts))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6">
        <header className="mb-12 text-center">
          <h1 className="diary-title text-3xl sm:text-4xl">Blog</h1>
          <p className="caption-text mt-3">记录生活与技术的点滴</p>
        </header>
        <BlogList posts={posts} />
      </div>
    </div>
  );
}
