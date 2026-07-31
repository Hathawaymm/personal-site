import { NextRequest, NextResponse } from "next/server";
import COS from "cos-nodejs-sdk-v5";

const STATIC_BUCKET = "d793-static-psn-site-m5-d2g6kt88h3b1d7da8-1303247881";
const STATIC_REGION = "ap-shanghai";
const STATIC_DOMAIN = "https://psn-site-m5-d2g6kt88h3b1d7da8-1303247881.tcloudbaseapp.com";
const ALLOWED_EXT = ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "pdf"];

const cos = new COS({
  SecretId: process.env.TENCENTCLOUD_SECRETID || "",
  SecretKey: process.env.TENCENTCLOUD_SECRETKEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "没有文件" }, { status: 400 });

    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return NextResponse.json({ error: "不支持的文件类型: " + ext }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    await new Promise<void>((resolve, reject) => {
      cos.putObject(
        {
          Bucket: STATIC_BUCKET,
          Region: STATIC_REGION,
          Key: key,
          Body: buffer,
          ContentType: file.type || "application/octet-stream",
        },
        (err) => (err ? reject(err) : resolve())
      );
    });

    return NextResponse.json({ url: `${STATIC_DOMAIN}/${key}` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "上传失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
