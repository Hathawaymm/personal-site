import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import sharp from "sharp";

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export class CareerImageError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function convertToWebp(input: Buffer): Promise<Buffer> {
  try {
    return await sharp(input).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 75 }).toBuffer();
  } catch {
    throw new CareerImageError("无法读取这张图片", 400);
  }
}

function uploadDir() {
  return process.env.CAREER_UPLOAD_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads", "career");
}

/** Public URL for a career image. Uses Vercel Blob when the token is set. */
export async function storeCareerImage(webp: Buffer): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`career/${Date.now()}.webp`, webp, {
      access: "public",
      contentType: "image/webp",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }
  if (process.env.NODE_ENV === "production") {
    throw new CareerImageError("未配置 BLOB_READ_WRITE_TOKEN", 503);
  }
  const name = `${Date.now()}.webp`;
  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), webp);
  return `/uploads/career/${name}`;
}
