import { NextResponse } from "next/server";
import https from "node:https";
import { signToken } from "@/lib/token";
import { invokeCloudFunction } from "@/lib/cloudbase";

const REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || "http://localhost:3000/auth/callback";

function httpPost(url: string, headers: Record<string, string>, body: string): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: "POST",
      headers: { ...headers, "Content-Length": String(Buffer.byteLength(body)) },
      timeout: 15000,
    }, (res) => {
      let data = "";
      res.on("data", (c) => data += c);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch { resolve({ raw: data }); }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("GitHub API 超时")); });
    req.write(body);
    req.end();
  });
}

function httpGet(url: string, headers: Record<string, string>): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: "GET",
      headers,
      timeout: 15000,
    }, (res) => {
      let data = "";
      res.on("data", (c) => data += c);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch { resolve({ raw: data }); }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("GitHub API 超时")); });
    req.end();
  });
}

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "GITHUB_CLIENT_ID 未配置" }, { status: 500 });
  }
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=read:user`;
  return NextResponse.json({ url });
}

export async function POST(req: Request) {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "GitHub OAuth 配置未完成" }, { status: 500 });
    }

    const body = await req.json() as Record<string, string>;
    const { gid, login } = body;

    if (gid && login) {
      const signed = await signToken(JSON.stringify({ g: String(gid), l: String(login) }));
      const res = NextResponse.json({ success: true });
      res.cookies.set("github_token", signed, { path: "/", maxAge: 604800, sameSite: "lax" });
      return res;
    }

    const { code } = body;
    if (!code) return NextResponse.json({ error: "缺少 code" }, { status: 400 });

    // Exchange code for token directly via GitHub API
    const tokenData = await httpPost(
      "https://github.com/login/oauth/access_token",
      { "Content-Type": "application/json", "Accept": "application/json" },
      JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
    );

    if ((tokenData as Record<string, string>).error) {
      const err = tokenData as Record<string, string>;
      return NextResponse.json({ error: err.error_description || err.error || "GitHub token 交换失败" }, { status: 500 });
    }

    const accessToken = (tokenData as Record<string, string>).access_token;
    if (!accessToken) {
      return NextResponse.json({ error: "GitHub 返回异常：缺少 access_token" }, { status: 500 });
    }

    // Get user info from GitHub
    const userData = await httpGet("https://api.github.com/user", {
      "Authorization": `Bearer ${accessToken}`,
      "User-Agent": "psn-site",
    });

    const ghUser = userData as Record<string, string | number>;
    if (!ghUser.id || !ghUser.login) {
      return NextResponse.json({ error: "获取 GitHub 用户信息失败" }, { status: 500 });
    }

    // Sign token and set cookie
    const signed = await signToken(JSON.stringify({ g: String(ghUser.id), l: String(ghUser.login) }));
    const res = NextResponse.json({ success: true });
    res.cookies.set("github_token", signed, { path: "/", maxAge: 604800, sameSite: "lax" });
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "未知错误";
    console.error("GitHub auth error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
