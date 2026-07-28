const CLOUDBASE_API = "https://psn-site-m5-d2g6kt88h3b1d7da8.ap-shanghai.tcb-api.tencentcloudapi.com/web";

export async function invokeCloudFunction(
  functionName: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const res = await fetch(`${CLOUDBASE_API}?name=${functionName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`CloudBase HTTP ${res.status}`);
  }

  const json = await res.json();
  return json.result || json;
}
