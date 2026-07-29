import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/token";
import { invokeCloudFunction } from "@/lib/cloudbase";

export async function GET(req: NextRequest) {
  const rawToken = req.cookies.get("github_token")?.value;
  if (!rawToken) {
    return NextResponse.json({ isLoggedIn: false }, { status: 401 });
  }

  const user = await verifyToken(rawToken);
  if (!user) {
    const res = NextResponse.json({ isLoggedIn: false }, { status: 401 });
    res.headers.set("Set-Cookie", "github_token=; Path=/; Max-Age=0; SameSite=Lax");
    return res;
  }

  try {
    const result = await invokeCloudFunction("auth", { action: "getCurrentUser", data: { uid: user.gid } });
    const cbResult = result as { code: number; user?: Record<string, unknown> };

    if (cbResult.code !== 0 || !cbResult.user) {
      return NextResponse.json({ isLoggedIn: true, isAdmin: false, status: "pending", permissions: {} }, { status: 200 });
    }

    const dbUser = cbResult.user;

    let permissions: Record<string, boolean> = {};
    try {
      const permResult = await invokeCloudFunction("permissions", { action: "get", data: { uid: user.gid } });
      const permCbResult = permResult as { code: number; permissions?: Record<string, boolean> };
      if (permCbResult.code === 0 && permCbResult.permissions) {
        permissions = permCbResult.permissions;
      }
    } catch {
      console.error("获取权限失败:", user.gid);
    }

    let needsInit = false;
    if (dbUser.is_admin !== true) {
      try {
        const initResult = await invokeCloudFunction("auth", { action: "checkInit", data: {} });
        const initCbResult = initResult as { hasAdmin?: boolean };
        needsInit = initCbResult.hasAdmin === false;
      } catch {
        console.error("检查系统初始化状态失败");
      }
    }

    return NextResponse.json({
      isLoggedIn: true,
      isAdmin: dbUser.is_admin === true,
      status: (dbUser.status as string) || "pending",
      nickname: (dbUser.nickname as string) || "",
      avatar: (dbUser.avatar_url as string) || "",
      githubId: String(dbUser.github_id),
      githubLogin: (dbUser.github_username as string) || "",
      permissions,
      needsInit,
    });
  } catch (err) {
    console.error("获取用户信息失败:", err);
    return NextResponse.json({ isLoggedIn: true, isAdmin: false, status: "pending", permissions: {} }, { status: 200 });
  }
}
