import { NextRequest, NextResponse } from "next/server";
import { CareerImageError, convertToWebp, MAX_IMAGE_BYTES, storeCareerImage } from "@/lib/career-image";
import { requireAdminRequest } from "@/lib/require-admin";

export async function POST(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "缺少文件" }, { status: 400 });
  if (file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: "图片不能超过 4MB" }, { status: 413 });
  if (file.type && !file.type.startsWith("image/")) return NextResponse.json({ error: "请上传图片文件" }, { status: 400 });
  try {
    const webp = await convertToWebp(Buffer.from(await file.arrayBuffer()));
    const url = await storeCareerImage(webp);
    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof CareerImageError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("作品集图片上传失败", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
