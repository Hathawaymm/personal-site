"use client";

const ENV_ID = "psn-site-m5-d2g6kt88h3b1d7da8";

async function getCloudbase(): Promise<any> {
  if (typeof window !== "undefined" && (window as any).cloudbase?.init) {
    return (window as any).cloudbase;
  }
  
  // Dynamic import - only runs in browser
  const { default: cloudbase } = await import("@cloudbase/js-sdk");
  return cloudbase;
}

export async function uploadToCloudBase(file: File): Promise<string> {
  const cloudbase = await getCloudbase();
  const app = cloudbase.init({ env: ENV_ID });
  const auth = app.auth({ persistence: "none" });
  await auth.anonymousAuthProvider().signIn();

  const cloudPath = `uploads/${Date.now()}-${file.name}`;
  const result = await app.uploadFile({ cloudPath, filePath: file });
  const urlRes = await app.getTempFileURL({ fileList: [result.fileID] });
  return urlRes.fileList[0]?.tempFileURL || "";
}
