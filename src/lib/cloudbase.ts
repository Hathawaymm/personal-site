import cloudbase from "@cloudbase/manager-node";

let cachedManager: ReturnType<typeof cloudbase.init> | null = null;

function getManager() {
  if (!cachedManager) {
    cachedManager = cloudbase.init({
      envId: process.env.NEXT_PUBLIC_TCB_ENV_ID || "psn-site-m5-d2g6kt88h3b1d7da8",
      secretId: process.env.TENCENTCLOUD_SECRETID || "",
      secretKey: process.env.TENCENTCLOUD_SECRETKEY || "",
    });
  }
  return cachedManager;
}

export async function invokeCloudFunction(
  functionName: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const manager = getManager();
  const res = await manager.functions.invokeFunction(functionName, data);
  if (typeof res.RetMsg === "string") {
    try { return JSON.parse(res.RetMsg); } catch {}
  }
  return res as unknown as Record<string, unknown>;
}
