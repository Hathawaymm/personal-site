import { invokeCloudFunction } from "@/lib/cloudbase";

export async function logAdminAction(action: string, detail: string): Promise<void> {
  try {
    await invokeCloudFunction("site-data", { action: "addAdminLog", data: { action, detail } });
  } catch {
    /* 记录失败不影响主流程 */
  }
}
