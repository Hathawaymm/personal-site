import { NextResponse } from "next/server";
import { invokeCloudFunction } from "@/lib/cloudbase";
import { DEFAULT_HOMEPAGE } from "@/lib/data";

export async function GET() {
  try {
    const result = await invokeCloudFunction("site-data", { action: "getConfig", configKey: "homepage" });
    if (result.code === 0 && result.data) {
      return NextResponse.json({ ...DEFAULT_HOMEPAGE, ...(result.data as Record<string, unknown>) });
    }
    return NextResponse.json(DEFAULT_HOMEPAGE);
  } catch {
    return NextResponse.json(DEFAULT_HOMEPAGE);
  }
}
