import { exec } from "node:child_process";

export function invokeCloudFunction(
  functionName: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const tcbEnv = process.env.NEXT_PUBLIC_TCB_ENV_ID || "psn-site-m5-d2g6kt88h3b1d7da8";
    const sid = process.env.TENCENTCLOUD_SECRETID || "";
    const skey = process.env.TENCENTCLOUD_SECRETKEY || "";

    const payload = JSON.stringify({ functionName, data });
    const cmd = `TCB_ENV_ID=${tcbEnv} TCB_SECRET_ID=${sid} TCB_SECRET_KEY=${skey} node scripts/bridge-auth.js invoke '${payload}'`;

    exec(cmd, { cwd: process.cwd(), timeout: 30000, encoding: "utf-8" }, (error, stdout) => {
      if (error) {
        reject(new Error(`云函数调用失败: ${error.message}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error("云函数返回解析失败"));
      }
    });
  });
}
