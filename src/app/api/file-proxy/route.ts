import { NextRequest, NextResponse } from "next/server";
import https from "node:https";

const ALLOWED_HOSTS = ["tcloudbaseapp.com"];

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const parsed = new URL(url);
  if (!ALLOWED_HOSTS.some(h => parsed.hostname.endsWith(h))) {
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
      headers: { "User-Agent": "Vercel-File-Proxy/1.0" },
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
    pdf: "application/pdf",
    md: "text/markdown; charset=utf-8",
    markdown: "text/markdown; charset=utf-8",
    txt: "text/plain; charset=utf-8",
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  };
  return map[ext] || "application/octet-stream";
}
