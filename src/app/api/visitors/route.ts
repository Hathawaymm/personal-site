import { NextResponse } from "next/server";
import { invokeCloudFunction } from "@/lib/cloudbase";

export async function GET() {
  try {
    const result = await invokeCloudFunction("visitors", { action: "list", data: { uid: "42465252" } });
    return NextResponse.json(result.data || []);
  } catch { return NextResponse.json([]); }
}

export async function POST(req: Request) {
  try {
    const { action, visitor_uid } = await req.json();
    const result = await invokeCloudFunction("visitors", { action, data: { admin_uid: "42465252", visitor_uid } });
    if (result.code !== 0) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
