import Link from "next/link";

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "https://x.com",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "mailto:hello@example.com",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 4-10 8L2 4" />
      </svg>
    ),
  },
];

const SITE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-accent-gold/20 bg-bg-cream/85 pt-8 pb-6 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <span className="font-display text-lg font-bold tracking-wide text-accent-gold">
              我们的时光
            </span>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              用镜头记录每一个温暖日常。Built with Next.js and Tailwind CSS.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-primary">
              Navigate
            </h4>
            <ul className="flex flex-col gap-2">
              {SITE_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-text-muted transition-colors duration-200 hover:text-accent-gold"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-primary">
              Connect
            </h4>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted transition-all duration-200 hover:text-accent-gold"
                  aria-label={label}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-accent-gold/15 pt-6 text-center">
          <p className="font-caption text-xs text-text-muted">
            © {year} 我们的时光. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
