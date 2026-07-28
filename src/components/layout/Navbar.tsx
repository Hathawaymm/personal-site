"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import type { Permissions } from "@/lib/permissions";

interface NavLink {
  href: string;
  label: string;
  permission?: keyof Permissions;
}

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/resume", label: "简历", permission: "resume_text" },
  { href: "/portfolio", label: "作品", permission: "portfolio" },
  { href: "/family", label: "家庭", permission: "family" },
  { href: "/blog", label: "Blog", permission: "blog" },
  { href: "/photos", label: "照片墙", permission: "photos" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isLoggedIn, isAdmin, status, permissions, logout } = useAuth();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const canAccess = (link: NavLink) => {
    if (isAdmin) return true;
    if (!isLoggedIn) return false;
    if (!link.permission) return true;
    return permissions[link.permission] === true;
  };

  const handleLockedClick = (link: NavLink, e: React.MouseEvent) => {
    if (!isLoggedIn || !link.permission) return;
    if (status === "pending") {
      toast("哎呀，这个房间暂时上锁啦，管理员还没给你钥匙哦~", "warning");
    } else if (canAccess(link)) {
      return;
    } else {
      toast("哎呀，这个房间暂时上锁啦，管理员还没给你钥匙哦~", "warning");
    }
    e.preventDefault();
  };

  const showMenu = isLoggedIn;

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
            {showMenu && NAV_LINKS.map(link => {
              const accessible = canAccess(link);
              const locked = isLoggedIn && !isAdmin && link.permission && !accessible;
              return (
                <Link
                  key={link.href}
                  href={accessible ? link.href : "#"}
                  onClick={(e) => locked ? handleLockedClick(link, e) : undefined}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(link.href) && accessible
                      ? "text-accent-gold"
                      : locked
                        ? "text-text-muted/40 cursor-not-allowed"
                        : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {link.label}
                  {locked && <span className="ml-1 text-xs">🔒</span>}
                  {isActive(link.href) && accessible && (
                    <span className="absolute bottom-0 left-1/2 h-[2px] w-3/5 -translate-x-1/2 rounded-full bg-accent-gold/70" />
                  )}
                </Link>
              );
            })}
            {isAdmin && (
              <Link href="/dashboard" className="relative px-4 py-2 text-sm font-medium text-accent-rose transition-colors hover:opacity-80">
                后台管理
              </Link>
            )}
            {isLoggedIn && (
              <button onClick={logout} className="px-4 py-2 text-sm text-text-muted hover:text-text-primary">
                退出
              </button>
            )}
            {!isLoggedIn && pathname !== "/login" && (
              <Link href="/login" className="px-4 py-2 text-sm text-accent-gold hover:opacity-80">
                登录
              </Link>
            )}
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex flex-col gap-[5px] p-2 sm:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <span className={`block h-[2px] w-6 rounded-full bg-text-primary transition-all duration-300 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`block h-[2px] w-6 rounded-full bg-text-primary transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-[2px] w-6 rounded-full bg-text-primary transition-all duration-300 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-40 bg-bg-cream/85 backdrop-blur-md transition-all duration-300 sm:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      >
        <div className="flex h-full flex-col items-center justify-center gap-8" onClick={(e) => e.stopPropagation()}>
          {showMenu && NAV_LINKS.map((link, i) => {
            const accessible = canAccess(link);
            const locked = isLoggedIn && !isAdmin && link.permission && !accessible;
            return (
              <Link
                key={link.href}
                href={accessible ? link.href : "#"}
                onClick={(e) => locked ? handleLockedClick(link, e) : undefined}
                className={`font-display text-2xl tracking-wide transition-all duration-300 ${
                  menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                } ${
                  isActive(link.href) && accessible
                    ? "text-accent-gold"
                    : locked
                      ? "text-text-muted/40"
                      : "text-text-secondary hover:text-text-primary"
                }`}
                style={{ transitionDelay: menuOpen ? `${i * 80}ms` : "0ms" }}
              >
                {link.label}{locked ? " 🔒" : ""}
              </Link>
            );
          })}
          {isAdmin && (
            <Link href="/dashboard" className="font-display text-2xl text-accent-rose" style={{ transitionDelay: `${NAV_LINKS.length * 80}ms` }}>
              后台管理
            </Link>
          )}
          {isLoggedIn ? (
            <button onClick={logout} className="text-base text-text-muted" style={{ transitionDelay: `${(NAV_LINKS.length + 1) * 80}ms` }}>
              退出登录
            </button>
          ) : (
            <Link href="/login" className="text-base text-accent-gold" style={{ transitionDelay: `${(NAV_LINKS.length + 1) * 80}ms` }}>
              登录
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
