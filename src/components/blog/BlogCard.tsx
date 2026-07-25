import Link from "next/link";

interface BlogCardProps {
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  slug: string;
  readTime: string;
}

const accentColors = [
  "from-accent-rose to-accent-rose/60",
  "from-accent-gold to-accent-gold/60",
  "from-accent-sage to-accent-sage/60",
  "from-accent-sky to-accent-sky/60",
] as const;

const tagBorders = [
  "border-accent-rose/50 text-accent-rose",
  "border-accent-gold/50 text-accent-gold",
  "border-accent-sage/50 text-accent-sage",
  "border-accent-sky/50 text-accent-sky",
] as const;

function hashIndex(str: string, arr: readonly string[]): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return arr[Math.abs(hash) % arr.length];
}

export default function BlogCard({
  title,
  excerpt,
  date,
  tags,
  slug,
  readTime,
}: BlogCardProps) {
  const accent = hashIndex(slug, accentColors);
  const tagBorder = hashIndex(slug, tagBorders);

  return (
    <Link
      href={`/blog/${slug}`}
      className="group block rounded-lg border border-accent-gold/20 bg-bg-cream/85 shadow-paper backdrop-blur transition-all duration-300 hover:scale-[1.02] hover:border-accent-gold/50 hover:shadow-paper-hover"
    >
      <article className="flex flex-col h-full">
        {/* Accent line at top */}
        <div className={`h-1 rounded-t-xl bg-linear-to-r ${accent}`} />

        <div className="flex flex-col flex-1 gap-3 p-5">
          {/* Title */}
          <h2 className="text-lg font-semibold leading-snug text-text-primary transition-colors duration-300 group-hover:text-accent-gold">
            {title}
          </h2>

          {/* Excerpt */}
          <p className="text-sm leading-relaxed text-text-secondary line-clamp-3">
            {excerpt}
          </p>

          {/* Spacer pushes meta to bottom */}
          <div className="flex-1" />

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${tagBorder}`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Date + Read time */}
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <time dateTime={date}>{date}</time>
            <span aria-hidden="true">&middot;</span>
            <span>{readTime}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
