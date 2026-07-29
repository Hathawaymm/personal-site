import { NextRequest, NextResponse } from "next/server";
import { invokeCloudFunction } from "@/lib/cloudbase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "没有文件" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const result = await invokeCloudFunction("upload", {
      action: "upload",
      fileContent: base64,
      fileName: file.name,
      folder: "uploads",
    });

    if (result.code !== 0) {
      return NextResponse.json({ error: result.error || "上传失败" }, { status: 500 });
    }

    return NextResponse.json({ url: (result as Record<string, string>).url || "" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "未知错误";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
