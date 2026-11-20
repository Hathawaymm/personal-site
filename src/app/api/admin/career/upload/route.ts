import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdminRequest } from "@/lib/require-admin";

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "缺少文件" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "图片不能超过 4MB" }, { status: 413 });
  const webp = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`career/${Date.now()}.webp`, webp, { access: "public", contentType: "image/webp", token: process.env.BLOB_READ_WRITE_TOKEN });
    return NextResponse.json({ url: blob.url });
  }
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "未配置 BLOB_READ_WRITE_TOKEN" }, { status: 503 });
  }
  const name = `${Date.now()}.webp`;
  const dir = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads", "career");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), webp);
  return NextResponse.json({ url: `/uploads/career/${name}` });
}
