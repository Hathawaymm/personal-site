import crypto from "crypto";

const AUTH_SECRET = "cf2726c73d8af472ade6f81cd9c9332980c1890e";

async function signToken(payload: string): Promise<string> {
  const hmac = crypto.createHmac("sha256", AUTH_SECRET);
  hmac.update(payload);
  return payload + "." + hmac.digest("hex");
}

export async function getTestTokens() {
  const tokens: Record<string, string> = {};

  tokens.admin = await signToken(JSON.stringify({ g: "42465252", l: "Hathawaymm" }));
  tokens.pending = await signToken(JSON.stringify({ g: "999001", l: "test-pending" }));
  tokens.rejected = await signToken(JSON.stringify({ g: "999002", l: "test-rejected" }));
  tokens.textonly = await signToken(JSON.stringify({ g: "999003", l: "test-textonly" }));
  tokens.full = await signToken(JSON.stringify({ g: "999004", l: "test-full" }));

  return tokens;
}
