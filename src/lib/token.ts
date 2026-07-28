const AUTH_SECRET = process.env.GITHUB_CLIENT_SECRET || "";

function getSecret(): string {
  if (!AUTH_SECRET) throw new Error("GITHUB_CLIENT_SECRET 未配置");
  return AUTH_SECRET;
}

export async function signToken(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const hex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${payload}.${hex}`;
}

export async function verifyToken(token: string): Promise<{ gid: string; login: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payload, sigHex] = parts;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", encoder.encode(getSecret()),
      { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
    );

    const sigBytes = new Uint8Array(sigHex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(payload));
    if (!valid) return null;

    const parsed = JSON.parse(payload);
    return { gid: parsed.g, login: parsed.l };
  } catch {
    return null;
  }
}

export function parseTokenPayload(token: string): { gid: string; login: string } | null {
  try {
    const payload = token.split(".")[0];
    const parsed = JSON.parse(payload);
    if (!parsed.g || !parsed.l) return null;
    return { gid: parsed.g, login: parsed.l };
  } catch {
    return null;
  }
}
