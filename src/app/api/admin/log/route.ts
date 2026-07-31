import { NextResponse } from "next/server";
import { invokeCloudFunction } from "@/lib/cloudbase";

export async function GET() {
  try {
    const result = await invokeCloudFunction("site-data", { action: "listAdminLogs" });
    return NextResponse.json(result.data || []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const { action, detail } = await req.json();
    const result = await invokeCloudFunction("site-data", { action: "addAdminLog", data: { action, detail } });
    if (result.code !== 0) {
      return NextResponse.json({ error: (result as Record<string, string>).error || "记录失败" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "记录失败" }, { status: 500 });
  }
}
