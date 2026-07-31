import { NextRequest, NextResponse } from "next/server";
import https from "node:https";

const CDN_HOST = "tcb.qcloud.la";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url || !url.includes(CDN_HOST)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const buffer = await fetchRaw(url);
    const contentType = guessContentType(url);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Proxy error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

function fetchRaw(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options: https.RequestOptions = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: "GET",
      headers: { "User-Agent": "Vercel-Image-Proxy/1.0" },
    };
    https.get(options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Upstream ${res.statusCode}`));
        res.resume();
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

function guessContentType(url: string): string {
  const ext = url.split(".").pop()?.split("?")[0].toLowerCase() || "";
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp", mp4: "video/mp4", mov: "video/quicktime",
  };
  return map[ext] || "application/octet-stream";
}
