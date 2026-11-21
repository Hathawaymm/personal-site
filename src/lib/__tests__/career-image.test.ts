import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";

vi.mock("@vercel/blob", () => ({
  put: vi.fn(async () => ({ url: "https://example.blob.vercel-storage.com/career/1.webp" })),
}));

import { put } from "@vercel/blob";
import { convertToWebp, storeCareerImage } from "@/lib/career-image";

describe("career images", () => {
  const previousBlob = process.env.BLOB_READ_WRITE_TOKEN;
  const previousDir = process.env.CAREER_UPLOAD_DIR;
  let dir = "";

  afterEach(async () => {
    if (previousBlob === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
    else process.env.BLOB_READ_WRITE_TOKEN = previousBlob;
    if (previousDir === undefined) delete process.env.CAREER_UPLOAD_DIR;
    else process.env.CAREER_UPLOAD_DIR = previousDir;
    vi.clearAllMocks();
    if (dir) await rm(dir, { recursive: true, force: true });
    dir = "";
  });

  it("turns an upload into webp and stores it on Blob when configured", async () => {
    const png = await sharp({ create: { width: 32, height: 24, channels: 3, background: { r: 220, g: 40, b: 40 } } }).png().toBuffer();
    const webp = await convertToWebp(png);
    expect(webp.subarray(0, 4).toString("ascii")).toBe("RIFF");
    process.env.BLOB_READ_WRITE_TOKEN = "test-token";
    await expect(storeCareerImage(webp)).resolves.toBe("https://example.blob.vercel-storage.com/career/1.webp");
    expect(put).toHaveBeenCalledWith(
      expect.stringMatching(/^career\/\d+\.webp$/),
      webp,
      expect.objectContaining({ access: "public", contentType: "image/webp", token: "test-token" }),
    );
  });

  it("writes a local webp when Blob is not configured", async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    dir = await mkdtemp(path.join(os.tmpdir(), "career-img-"));
    process.env.CAREER_UPLOAD_DIR = dir;
    const webp = await sharp({ create: { width: 8, height: 8, channels: 3, background: "#224488" } }).webp().toBuffer();
    const url = await storeCareerImage(webp);
    expect(url).toMatch(/^\/uploads\/career\/\d+\.webp$/);
    const saved = await readFile(path.join(dir, path.basename(url)));
    expect(saved.equals(webp)).toBe(true);
  });
});