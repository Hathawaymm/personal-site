import { NextResponse } from "next/server";
import { signToken } from "@/lib/token";
import { invokeCloudFunction } from "@/lib/cloudbase";

const REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || "http://localhost:3000/auth/callback";

function getCookieHeader(token: string): string {
  const isSecure = process.env.NODE_ENV === "production";
  const cookie = `github_token=${encodeURIComponent(token)}; Path=/; Max-Age=604800; SameSite=Lax`;
  return isSecure ? `${cookie}; Secure` : cookie;
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

    if (!clientSecret) {
      return NextResponse.json({ error: "GITHUB_CLIENT_SECRET 未配置" }, { status: 500 });
    }

    const body = await req.json() as Record<string, string>;
    const { gid, login } = body;

    if (gid && login) {
      const signed = await signToken(JSON.stringify({ g: String(gid), l: String(login) }));
      const res = NextResponse.json({ success: true });
      res.headers.set("Set-Cookie", getCookieHeader(signed));
      return res;
    }

    const { code } = body;
    if (!code) return NextResponse.json({ error: "缺少 code" }, { status: 400 });

    const result = await invokeCloudFunction("auth", {
      action: "exchangeCode",
      data: { code, clientId, clientSecret },
    });

    const retMsgRaw = (result.RetMsg as string) || "{}";
    const cbResult = JSON.parse(retMsgRaw);

    if (cbResult.code !== 0) {
      const errMsg = (cbResult.error as string) || "云函数交换失败";
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    const ghUser = cbResult.user as { gid: string; login: string; avatar: string; email: string };

    try {
      await invokeCloudFunction("auth", {
        action: "onLogin",
        data: {
          uid: ghUser.gid,
          username: ghUser.login,
          avatarUrl: ghUser.avatar,
          email: ghUser.email,
          adminGithubId: process.env.ADMIN_GITHUB_ID || "",
        },
      });
    } catch (err) {
      console.error("onLogin 失败:", err);
    }

    const signed = await signToken(JSON.stringify({ g: ghUser.gid, l: ghUser.login }));
    const res = NextResponse.json({ success: true });
    res.headers.set("Set-Cookie", getCookieHeader(signed));
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "未知错误";
    console.error("GitHub auth error:", msg);
    return NextResponse.json({ error: "服务异常，请稍后再试" }, { status: 500 });
  }
}
