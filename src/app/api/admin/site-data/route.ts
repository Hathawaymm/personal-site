import { NextResponse } from "next/server";
import { readSiteData, writeSiteData } from "@/lib/data";
import { revalidatePath } from "next/cache";

export async function GET() {
  const data = readSiteData();
  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const data = await req.json();
  writeSiteData(data);
  revalidatePath("/");
  return NextResponse.json({ success: true });
}
