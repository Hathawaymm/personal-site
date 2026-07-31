import { NextResponse } from "next/server";
import { invokeCloudFunction } from "@/lib/cloudbase";
import { parseTokenPayload } from "@/lib/token";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const token = cookie.split(";").map(c => c.trim()).find(c => c.startsWith("github_token="))?.split("=").slice(1).join("=") || "";
    const payload = token ? parseTokenPayload(decodeURIComponent(token)) : null;
    if (!payload) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const { nickname, avatar, email } = await req.json();
    const result = await invokeCloudFunction("auth", {
      action: "onLogin",
      data: { uid: payload.gid, username: payload.login, nickname, avatarUrl: avatar, email: email || "" },
    });
    if (result.code !== 0) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
