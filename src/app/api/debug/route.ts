import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    CLOUD_ENV: process.env.NEXT_PUBLIC_TCB_ENV_ID || "MISSING",
    CLIENT_ID_LEN: (process.env.GITHUB_CLIENT_ID || "").length,
    CLIENT_SECRET_LEN: (process.env.GITHUB_CLIENT_SECRET || "").length,
    SECRET_ID_LEN: (process.env.TENCENTCLOUD_SECRETID || "").length,
    SECRET_KEY_LEN: (process.env.TENCENTCLOUD_SECRETKEY || "").length,
    NODE_ENV: process.env.NODE_ENV,
  });
}
