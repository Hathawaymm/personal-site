import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/token";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const rawToken = req.cookies.get("github_token")?.value;

  let isValid = false;
  if (rawToken) {
    const user = await verifyToken(rawToken);
    isValid = user !== null;
  }

  if (pathname.startsWith("/api/admin")) {
    if (!isValid) return NextResponse.json({ error: "未登录" }, { status: 401 });
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    if (!isValid) return NextResponse.redirect(new URL("/login", req.url));
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/api/admin/:path*"],
};
