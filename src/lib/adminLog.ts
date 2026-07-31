export async function logAdminAction(action: string, detail: string): Promise<void> {
  try {
    await fetch("/api/admin/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, detail }),
    });
  } catch {
    /* 记录失败不影响主流程 */
  }
}
