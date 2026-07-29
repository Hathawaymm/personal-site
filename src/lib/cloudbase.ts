import crypto from "node:crypto";
import https from "node:https";

function sign(secretKey: string, date: string, service: string, stringToSign: string): string {
  const kDate = crypto.createHmac("sha256", "TC3" + secretKey).update(date).digest();
  const kService = crypto.createHmac("sha256", kDate).update(service).digest();
  const kSigning = crypto.createHmac("sha256", kService).update("tc3_request").digest();
  return crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");
}

export async function invokeCloudFunction(
  functionName: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const secretId = process.env.TENCENTCLOUD_SECRETID || "";
  const secretKey = process.env.TENCENTCLOUD_SECRETKEY || "";
  const envId = process.env.NEXT_PUBLIC_TCB_ENV_ID || "psn-site-m5-d2g6kt88h3b1d7da8";

  const body = JSON.stringify({
    FunctionName: functionName,
    Namespace: envId,
    InvocationType: "RequestResponse",
    ClientContext: JSON.stringify(data),
  });

  const timestamp = Math.floor(Date.now() / 1000);
  const date = new Date(timestamp * 1000).toISOString().split("T")[0];
  const region = "ap-shanghai";
  const service = "scf";
  const host = "scf.tencentcloudapi.com";

  const headers = `content-type:application/json\nhost:${host}\n`;
  const signedHeaders = "content-type;host";
  const hashedPayload = crypto.createHash("sha256").update(body).digest("hex");

  const canonicalRequest = `POST\n/\n\n${headers}\n${signedHeaders}\n${hashedPayload}`;
  const hashedRequest = crypto.createHash("sha256").update(canonicalRequest).digest("hex");
  const stringToSign = `TC3-HMAC-SHA256\n${timestamp}\n${date}/${service}/tc3_request\n${hashedRequest}`;
  const signature = sign(secretKey, date, service, stringToSign);
  const authorization = `TC3-HMAC-SHA256 Credential=${secretId}/${date}/${service}/tc3_request, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: host,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Host": host,
        "X-TC-Action": "Invoke",
        "X-TC-Version": "2018-04-16",
        "X-TC-Region": region,
        "X-TC-Timestamp": String(timestamp),
        Authorization: authorization,
      },
    }, (res) => {
      let text = "";
      res.on("data", c => text += c);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(text);
          if (parsed.Response?.Error) {
            reject(new Error(parsed.Response.Error.Message));
            return;
          }
          const retMsg = parsed.Response?.Result?.RetMsg;
          if (retMsg) {
            try { resolve(JSON.parse(retMsg)); return; } catch {}
          }
          resolve(parsed.Response?.Result || {});
        } catch {
          resolve({});
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}
