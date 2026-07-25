export interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  slug: string;
  readTime: string;
}

export const blogPosts: BlogPost[] = [
  {
    title: "Building This Site with Next.js and Neon Dreams",
    excerpt:
      "How I went from a blank canvas to a glowing anime personal site using Next.js 16, Tailwind CSS, and a healthy obsession with neon pink.",
    date: "2026-07-10",
    tags: ["Next.js", "Tailwind CSS", "TypeScript"],
    slug: "building-this-site",
    readTime: "5 min",
  },
  {
    title: "Life with Three Pets: Chaos and Cuddles",
    excerpt:
      "Managing a border collie, an orange tabby, and a white cat under one roof. The daily wrestling matches, sunbeam disputes, and the occasional truce.",
    date: "2026-07-02",
    tags: ["Pets", "Life"],
    slug: "life-with-three-pets",
    readTime: "4 min",
  },
  {
    title: "Why I Switched to TypeScript Strict Mode",
    excerpt:
      "A journey from loose any-types to full strict mode. The pain, the payoff, and why I will never go back to untyped JavaScript again.",
    date: "2026-06-25",
    tags: ["TypeScript", "Engineering"],
    slug: "typescript-strict-mode",
    readTime: "6 min",
  },
  {
    title: "Training a Border Collie: Two Years In",
    excerpt:
      "What worked, what did not, and the surprising things my border collie taught me about patience, consistency, and the meaning of a well-thrown frisbee.",
    date: "2026-06-15",
    tags: ["Pets", "Training"],
    slug: "training-border-collie",
    readTime: "7 min",
  },
];
