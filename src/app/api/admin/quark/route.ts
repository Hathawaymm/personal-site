import { NextResponse } from "next/server";
import { invokeCloudFunction } from "@/lib/cloudbase";

// 夸克网盘中转（list 列文件 / download 转存COS / thumbs 缩略图 / health 检查cookie）
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { action, pdir_fid, fids, page, size } = await req.json();
    if (!action) return NextResponse.json({ error: "缺少 action" }, { status: 400 });
    const result = await invokeCloudFunction("quark", { action, pdir_fid: pdir_fid || "0", fids: fids || [], page, size });
    if (result.code !== 0) {
      return NextResponse.json({ error: (result as { error?: string }).error || "夸克操作失败", cookieInvalid: result.cookieInvalid === true }, { status: 200 });
    }
    return NextResponse.json({ data: result.data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "夸克操作失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
