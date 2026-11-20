import { NextRequest, NextResponse } from "next/server";
import { seedCareerDocument } from "@/data/career-document";
import { persistCareer } from "@/lib/career-content";
import { careerStorage, listCareerRevisions } from "@/lib/career-store";
import { CareerValidationError } from "@/lib/career-validate";
import { requireAdminRequest } from "@/lib/require-admin";

export async function GET(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const history = await listCareerRevisions(8);
  const draft = history.find((row) => row.kind === "draft")?.body ?? null;
  const published = history.find((row) => row.kind === "published")?.body ?? null;
  return NextResponse.json({
    document: draft ?? published ?? seedCareerDocument(),
    history: history.map(({ id, kind, createdAt }) => ({ id, kind, createdAt })),
    storage: careerStorage(),
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return NextResponse.json({ error: "未登录" }, { status: 401 });
  try {
    const payload = await req.json() as { action?: string; document?: unknown; id?: number };
    if (payload.action === "revert") {
      const history = await listCareerRevisions(40);
      const found = history.find((row) => row.id === Number(payload.id));
      if (!found) return NextResponse.json({ error: "找不到这一版" }, { status: 404 });
      const saved = await persistCareer("published", found.body);
      return NextResponse.json({ ok: true, id: saved.id });
    }
    if (payload.action !== "draft" && payload.action !== "publish") {
      return NextResponse.json({ error: "未知操作" }, { status: 400 });
    }
    const saved = await persistCareer(payload.action === "publish" ? "published" : "draft", payload.document);
    return NextResponse.json({ ok: true, id: saved.id });
  } catch (error) {
    const message = error instanceof CareerValidationError ? error.message : error instanceof Error ? error.message : "保存失败";
    const status = error instanceof CareerValidationError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
