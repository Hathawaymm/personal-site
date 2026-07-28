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

function mapToBlogPost(item: Record<string, unknown>): BlogPostDetail {
  return {
    _id: item._id as string | undefined,
    title: (item.title as string) || "",
    excerpt: (item.excerpt as string) || "",
    date: (item.date as string) || "",
    tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
    slug: (item.slug as string) || "",
    readTime: (item.readTime as string) || "",
    content: (item.content as string) || "",
    status: (item.status as string) || "published",
  };
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(
      `https://psn-site-m5-d2g6kt88h3b1d7da8.ap-shanghai.tcb-api.tencentcloudapi.com/web?name=content`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get", type: "blog" }),
      }
    );
    const json = await res.json();
    const result = json.result || json;
    if (result.code !== 0 || !result.data) return [];
    return (result.data as Record<string, unknown>[])
      .map(mapToBlogPost)
      .filter(p => p.status === "published")
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  try {
    const posts = await fetchBlogPosts();
    const post = posts.find(p => p.slug === slug);
    if (!post) return null;

    const res = await fetch(
      `https://psn-site-m5-d2g6kt88h3b1d7da8.ap-shanghai.tcb-api.tencentcloudapi.com/web?name=content`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get", type: "blog" }),
      }
    );
    const json = await res.json();
    const result = json.result || json;
    if (result.code === 0 && result.data) {
      const found = (result.data as Record<string, unknown>[]).find(
        (item: Record<string, unknown>) => item.slug === slug
      );
      if (found) return mapToBlogPost(found);
    }

    return { ...post };
  } catch {
    return null;
  }
}
