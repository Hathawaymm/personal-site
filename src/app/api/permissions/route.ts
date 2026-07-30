import { NextResponse } from "next/server";
import { invokeCloudFunction } from "@/lib/cloudbase";

export async function GET(req: Request) {
  try {
    const uid = new URL(req.url).searchParams.get("uid") || "";
    const result = await invokeCloudFunction("permissions", { action: "get", data: { uid } });
    return NextResponse.json(result.permissions || {});
  } catch { return NextResponse.json({}); }
}

export async function POST(req: Request) {
  try {
    const { visitor_uid, modules } = await req.json();
    const result = await invokeCloudFunction("permissions", { action: "update", data: { admin_uid: "42465252", visitor_uid, modules } });
    if (result.code !== 0) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
