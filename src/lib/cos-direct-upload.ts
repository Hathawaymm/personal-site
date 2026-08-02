// 浏览器直传腾讯云 COS（绕过 Vercel 4.5MB 限制）
// 临时密钥由 /api/admin/cos-sts 签发，scope 限定 uploads/ 前缀

const STATIC_DOMAIN = "https://psn-site-m5-d2g6kt88h3b1d7da8-1303247881.tcloudbaseapp.com";
const STATIC_BUCKET = "d793-static-psn-site-m5-d2g6kt88h3b1d7da8-1303247881";
const STATIC_REGION = "ap-shanghai";

const ALLOWED_EXT = ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "webm", "pdf", "md", "markdown", "txt"];

interface CosCredentials {
  TmpSecretId: string;
  TmpSecretKey: string;
  SecurityToken: string;
  StartTime: number;
  ExpiredTime: number;
}

export interface UploadProgress {
  percent: number;
  loaded?: number;
  total?: number;
}

interface PutObjectParams {
  Bucket: string;
  Region: string;
  Key: string;
  Body: File;
  onProgress?: (info: UploadProgress) => void;
}

interface CosClient {
  putObject(params: PutObjectParams): Promise<unknown>;
}

interface CosOptions {
  getAuthorization(
    options: { Method: string; Bucket: string; Region: string },
    callback: (credentials: CosCredentials | Error) => void
  ): void;
}

let cachedCos: CosClient | null = null;

async function getCos(): Promise<CosClient> {
  if (cachedCos) return cachedCos;
  // 动态 import，避免 SSR 时加载浏览器 SDK
  const mod = await import("cos-js-sdk-v5");
  const CosConstructor = mod.default as unknown as { new (opts: CosOptions): CosClient };
  cachedCos = new CosConstructor({
    getAuthorization: async (_options, callback) => {
      try {
        const res = await fetch("/api/admin/cos-sts");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        callback({
          TmpSecretId: data.tmpSecretId,
          TmpSecretKey: data.tmpSecretKey,
          SecurityToken: data.sessionToken,
          StartTime: data.startTime,
          ExpiredTime: data.expiredTime,
        });
      } catch (e) {
        callback(e instanceof Error ? e : new Error("获取上传凭证失败"));
      }
    },
  });
  return cachedCos;
}

// 浏览器直传 COS，返回永久公开 URL（与旧 /api/admin/upload 返回的 URL 结构完全一致）
export async function uploadToCos(
  file: File | Blob,
  fileName: string,
  onProgress?: (info: UploadProgress) => void
): Promise<string> {
  const ext = (fileName.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) throw new Error("不支持的文件类型: " + ext);

  const cos = await getCos();
  const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await cos.putObject({
    Bucket: STATIC_BUCKET,
    Region: STATIC_REGION,
    Key: key,
    Body: file as File,
    onProgress,
  });
  return `${STATIC_DOMAIN}/${key}`;
}
