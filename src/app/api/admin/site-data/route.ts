import { NextResponse } from "next/server";
import { readSiteData, writeSiteData } from "@/lib/data";

export async function GET() {
  const data = await readSiteData();
  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const data = await req.json();
  try { await writeSiteData(data); } catch (e) { console.error("writeSiteData failed:", e); }
  return NextResponse.json({ success: true });
}
