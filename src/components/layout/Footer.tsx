"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DEFAULT_FOOTER, type FooterConfig } from "@/lib/data";

export default function Footer() {
  const [footer, setFooter] = useState<FooterConfig>(DEFAULT_FOOTER);

  useEffect(() => {
    fetch("/api/config?key=footer")
      .then(r => r.json())
      .then(d => {
        if (d && (d.tagline || d.siteLinks || d.socialLinks)) setFooter({ ...DEFAULT_FOOTER, ...d });
      })
      .catch(() => {});
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-accent-gold/20 bg-bg-cream/85 pt-8 pb-6 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <span className="font-display text-lg font-bold tracking-wide text-gold-strong">
              {footer.title}
            </span>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              {footer.tagline}
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-primary">
              Navigate
            </h4>
            <ul className="flex flex-col gap-2">
              {(footer.siteLinks || []).map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-text-muted transition-colors duration-200 hover:text-gold-strong"
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
            <div className="flex flex-col gap-2">
              {(footer.socialLinks || []).map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-muted transition-colors duration-200 hover:text-gold-strong"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-accent-gold/15 pt-6 text-center">
          <p className="font-caption text-xs text-text-muted">
            © {year} {footer.copyright}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
