import { NextResponse } from "next/server";
import { readSiteData } from "@/lib/data";

export async function GET() {
  const data = await readSiteData();
  return NextResponse.json(data);
}
