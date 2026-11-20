import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { invokeCloudFunction } from "@/lib/cloudbase";
import { verifyToken } from "@/lib/token";

export interface AdminIdentity {
  gid: string;
  login: string;
}

function devAdmin(): AdminIdentity | null {
  if (process.env.NODE_ENV === "production") return null;
  if (process.env.CAREER_EDITOR_DEV !== "1") return null;
  return { gid: "dev", login: "dev" };
}

async function adminFromToken(raw: string | undefined): Promise<AdminIdentity | null> {
  const bypass = devAdmin();
  if (bypass) return bypass;
  if (!raw) return null;
  const user = await verifyToken(raw);
  if (!user) return null;
  try {
    const result = await invokeCloudFunction("auth", { action: "getCurrentUser", data: { uid: user.gid } });
    const record = result as { code?: number; user?: { is_admin?: boolean } };
    if (record.code === 0 && record.user?.is_admin === true) return user;
  } catch (error) {
    console.error("管理员校验失败", error);
  }
  return null;
}

export async function requireAdminRequest(req: NextRequest): Promise<AdminIdentity | null> {
  return adminFromToken(req.cookies.get("github_token")?.value);
}

export async function requireAdminCookie(): Promise<AdminIdentity | null> {
  const jar = await cookies();
  return adminFromToken(jar.get("github_token")?.value);
}
