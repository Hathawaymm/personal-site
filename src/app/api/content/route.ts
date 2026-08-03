import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { invokeCloudFunction } from "@/lib/cloudbase";
import { verifyToken } from "@/lib/token";

const ALLOWED_TYPES = ["blog", "message"];

async function requireLogin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("github_token")?.value;
    if (!raw) return false;
    return (await verifyToken(raw)) !== null;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") || "blog";
  if (!ALLOWED_TYPES.includes(type)) return NextResponse.json([]);
  try {
    if (type === "message") {
      const ok = await requireLogin();
      if (!ok) return NextResponse.json([]);
    }
    const result = await invokeCloudFunction("content", { action: "get", type });
    return NextResponse.json(result.data || []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  const ok = await requireLogin();
  if (!ok) return NextResponse.json({ error: "未登录" }, { status: 401 });
  try {
    const body = await req.json();
    const { type, item, id } = body;
    if (!ALLOWED_TYPES.includes(type)) return NextResponse.json({ error: "不支持的 type" }, { status: 400 });
    const result = await invokeCloudFunction("content", { action: "save", type, data: item, id });
    if (result.code !== 0) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ success: true, id: result.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "服务器内部错误";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const ok = await requireLogin();
  if (!ok) return NextResponse.json({ error: "未登录" }, { status: 401 });
  try {
    const { id } = await req.json();
    const result = await invokeCloudFunction("content", { action: "delete", id });
    if (result.code !== 0) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "服务器内部错误";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
