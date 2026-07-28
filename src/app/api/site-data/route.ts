import { NextResponse } from "next/server";
import { readSiteData } from "@/lib/data";

export async function GET() {
  return NextResponse.json(readSiteData());
}
