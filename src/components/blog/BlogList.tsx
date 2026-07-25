import type { BlogPost } from "@/data/blog-posts";
import BlogCard from "./BlogCard";

interface BlogListProps {
  posts: BlogPost[];
}

export default function BlogList({ posts }: BlogListProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post.slug} {...post} />
      ))}
    </div>
  );
}
