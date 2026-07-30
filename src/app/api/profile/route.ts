import { NextResponse } from "next/server";
import { invokeCloudFunction } from "@/lib/cloudbase";

export async function POST(req: Request) {
  try {
    const { nickname, avatar } = await req.json();
    // Update user in CloudBase via auth cloud function
    const result = await invokeCloudFunction("auth", {
      action: "onLogin",
      data: { uid: "42465252", username: "Hathawaymm", nickname, avatarUrl: avatar, email: "" },
    });
    if (result.code !== 0) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
