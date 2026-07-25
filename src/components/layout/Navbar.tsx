"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home", section: null as string | null },
  { href: "/#resume", label: "简历", section: "resume" },
  { href: "/#works", label: "作品", section: "works" },
  { href: "/#family", label: "家庭", section: "family" },
  { href: "/blog", label: "Blog", section: null },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleNavClick = (e: React.MouseEvent, href: string, section: string | null) => {
    if (!section) return;
    e.preventDefault();
    if (pathname === "/") {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(href);
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-accent-gold/15 bg-bg-cream/60 shadow-sm backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span />

          <div className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map(({ href, label, section }) => (
              <Link
                key={href}
                href={href}
                onClick={(e) => handleNavClick(e, href, section)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive(href)
                    ? "text-accent-gold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {label}
                {isActive(href) && (
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-3/5 -translate-x-1/2 rounded-full bg-accent-gold/70" />
                )}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex flex-col gap-[5px] p-2 sm:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <span
              className={`block h-[2px] w-6 rounded-full bg-text-primary transition-all duration-300 ${
                menuOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-[2px] w-6 rounded-full bg-text-primary transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-[2px] w-6 rounded-full bg-text-primary transition-all duration-300 ${
                menuOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-40 bg-bg-cream/85 backdrop-blur-md transition-all duration-300 sm:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      >
        <div
          className="flex h-full flex-col items-center justify-center gap-8"
          onClick={(e) => e.stopPropagation()}
        >
          {NAV_LINKS.map(({ href, label, section }, i) => (
            <Link
              key={href}
              href={href}
              onClick={(e) => handleNavClick(e, href, section)}
              className={`font-display text-2xl tracking-wide transition-all duration-300 ${
                menuOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              } ${
                isActive(href)
                  ? "text-accent-gold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              style={{ transitionDelay: menuOpen ? `${i * 80}ms` : "0ms" }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
