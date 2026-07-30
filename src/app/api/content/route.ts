import { NextRequest, NextResponse } from "next/server";
import { invokeCloudFunction } from "@/lib/cloudbase";

export async function GET() {
  try {
    const result = await invokeCloudFunction("content", { action: "get", type: "blog" });
    return NextResponse.json(result.data || []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, item, id } = body;
    const result = await invokeCloudFunction("content", { action: "save", type, data: item, id });
    if (result.code !== 0) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ success: true, id: result.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const result = await invokeCloudFunction("content", { action: "delete", id });
    if (result.code !== 0) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
