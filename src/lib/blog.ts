export interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  slug: string;
  readTime: string;
  status?: string;
}

export interface BlogPostDetail extends BlogPost {
  content?: string;
  _id?: string;
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch("/api/content");
    if (!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data) ? data : [])
      .filter((p: Record<string, unknown>) => p.status !== "draft")
      .sort((a: BlogPost, b: BlogPost) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  try {
    const posts = await fetchBlogPosts();
    // 容错解码：URL 中的中文 slug 是编码形式（%E5%85%A5...），数据库存的是解码形式
    let decoded = slug;
    try { decoded = decodeURIComponent(slug); } catch { /* 已解码或含非法 % */ }
    return posts.find(p => p.slug === decoded || p.slug === slug) || null;
  } catch {
    return null;
  }
}
