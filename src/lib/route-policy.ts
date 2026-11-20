/** Which URLs are public career pages, and which the admin middleware guards. */

export const PUBLIC_CAREER_PATHS = ["/portfolio", "/desk", "/resume"] as const;

export const ADMIN_MATCHER = ["/admin/:path*", "/dashboard/:path*", "/api/admin/:path*"] as const;

export const LANG_STORAGE_KEY = "career-lang";

export function isPublicCareerPath(pathname: string): boolean {
  return PUBLIC_CAREER_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function requiresAdminSession(pathname: string): boolean {
  return pathname.startsWith("/api/admin") || pathname.startsWith("/admin") || pathname.startsWith("/dashboard");
}

/** Client-side AuthGuard pages. Not the middleware matcher. */
export function isVisitorGuardedPath(pathname: string): boolean {
  return pathname === "/family"
    || pathname.startsWith("/family/")
    || pathname === "/photos"
    || pathname.startsWith("/photos/")
    || pathname.startsWith("/space/");
}

export function readStoredLang(value: string | null): "zh" | "en" {
  return value === "en" ? "en" : "zh";
}
