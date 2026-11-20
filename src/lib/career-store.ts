import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { sanitizeCareerDocument } from "@/lib/career-validate";
import type { CareerDocument } from "@/data/career-document";

export type RevisionKind = "draft" | "published";

export interface CareerRevision {
  id: number;
  kind: RevisionKind;
  body: CareerDocument;
  createdAt: string;
}

export type CareerStorage = "neon" | "file" | "none";

function filePath() {
  return process.env.CAREER_CONTENT_FILE || path.join(/*turbopackIgnore: true*/ process.cwd(), ".data", "career-revisions.json");
}

export function careerStorage(): CareerStorage {
  if (process.env.DATABASE_URL) return "neon";
  if (process.env.NODE_ENV !== "production") return "file";
  return "none";
}

function sqlClient() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

async function ensureNeon() {
  const sql = sqlClient();
  if (!sql) return null;
  await sql`
    CREATE TABLE IF NOT EXISTS career_revisions (
      id bigserial PRIMARY KEY,
      kind text NOT NULL,
      body text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  return sql;
}

async function readFileRows(): Promise<CareerRevision[]> {
  try {
    const raw = await readFile(filePath(), "utf8");
    const parsed = JSON.parse(raw) as CareerRevision[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeFileRows(rows: CareerRevision[]) {
  await mkdir(path.dirname(filePath()), { recursive: true });
  await writeFile(filePath(), JSON.stringify(rows));
}

function parseBody(body: unknown): CareerDocument {
  const value = typeof body === "string" ? JSON.parse(body) : body;
  return sanitizeCareerDocument(value);
}

export async function listCareerRevisions(limit = 8): Promise<CareerRevision[]> {
  if (careerStorage() === "neon") {
    const sql = await ensureNeon();
    if (!sql) return [];
    const rows = await sql`SELECT id, kind, body, created_at FROM career_revisions ORDER BY id DESC LIMIT ${limit}` as {
      id: number; kind: string; body: string; created_at: string | Date;
    }[];
    return rows.map((row) => ({
      id: Number(row.id),
      kind: row.kind === "draft" ? "draft" : "published",
      body: parseBody(row.body),
      createdAt: new Date(row.created_at).toISOString(),
    }));
  }
  if (careerStorage() === "file") {
    const rows = await readFileRows();
    return rows.slice(-limit).reverse();
  }
  return [];
}

export async function latestCareer(kind: RevisionKind): Promise<CareerDocument | null> {
  const rows = await listCareerRevisions(30);
  return rows.find((row) => row.kind === kind)?.body ?? null;
}

export async function saveCareerRevision(kind: RevisionKind, input: unknown): Promise<CareerRevision> {
  if (careerStorage() === "none") {
    throw new Error("未配置 DATABASE_URL。请先在 Vercel 连接 Neon Postgres。");
  }
  const body = sanitizeCareerDocument(input);
  const createdAt = new Date().toISOString();
  if (careerStorage() === "neon") {
    const sql = await ensureNeon();
    if (!sql) throw new Error("DATABASE_URL 无效");
    const rows = await sql`
      INSERT INTO career_revisions (kind, body)
      VALUES (${kind}, ${JSON.stringify(body)})
      RETURNING id, created_at
    ` as { id: number; created_at: string | Date }[];
    return { id: Number(rows[0].id), kind, body, createdAt: new Date(rows[0].created_at).toISOString() };
  }
  const rows = await readFileRows();
  const id = (rows.at(-1)?.id ?? 0) + 1;
  const revision = { id, kind, body, createdAt };
  rows.push(revision);
  await writeFileRows(rows.slice(-40));
  return revision;
}

export async function revertCareerRevision(id: number): Promise<CareerRevision> {
  const rows = await listCareerRevisions(40);
  const found = rows.find((row) => row.id === id);
  if (!found) throw new Error("找不到这一版");
  return saveCareerRevision("published", found.body);
}
