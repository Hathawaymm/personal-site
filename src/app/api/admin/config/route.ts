import { NextResponse } from "next/server";
import { invokeCloudFunction } from "@/lib/cloudbase";

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key") || "homepage";
    const data = await req.json();
    const result = await invokeCloudFunction("site-data", { action: "putConfig", configKey: key, data });
    if (result.code !== 0) {
      return NextResponse.json({ error: (result as Record<string, string>).error || "保存失败" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "保存失败" }, { status: 500 });
  }
}
