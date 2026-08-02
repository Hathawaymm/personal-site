import { NextResponse } from "next/server";
import STS from "qcloud-cos-sts";

// 与 upload route 一致的 COS 配置
const STATIC_BUCKET = "d793-static-psn-site-m5-d2g6kt88h3b1d7da8-1303247881";
const STATIC_REGION = "ap-shanghai";
const APP_ID = "1303247881";

export async function GET() {
  const secretId = process.env.TENCENTCLOUD_SECRETID || "";
  const secretKey = process.env.TENCENTCLOUD_SECRETKEY || "";
  if (!secretId || !secretKey) {
    return NextResponse.json({ error: "未配置 COS 密钥" }, { status: 500 });
  }

  try {
    const policy = {
      version: "2.0",
      statement: [
        {
          effect: "allow",
          action: ["name/cos:PutObject"],
          resource: [`qcs::cos:${STATIC_REGION}:uid/${APP_ID}:${STATIC_BUCKET}/uploads/*`],
        },
      ],
    };

    const result = await STS.getCredential({
      secretId,
      secretKey,
      proxy: "",
      region: STATIC_REGION,
      policy,
      durationSeconds: 1800,
    });

    const c = result.credentials;
    return NextResponse.json({
      tmpSecretId: c.tmpSecretId,
      tmpSecretKey: c.tmpSecretKey,
      sessionToken: c.sessionToken,
      startTime: result.startTime,
      expiredTime: result.expiredTime,
      bucket: STATIC_BUCKET,
      region: STATIC_REGION,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "签发临时密钥失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
