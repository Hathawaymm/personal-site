import { scf } from "tencentcloud-sdk-nodejs-scf";

const ScfClient = scf.v20180416.Client;

let cachedClient: InstanceType<typeof ScfClient> | null = null;

function getClient() {
  if (!cachedClient) {
    cachedClient = new ScfClient({
      credential: {
        secretId: process.env.TENCENTCLOUD_SECRETID || "",
        secretKey: process.env.TENCENTCLOUD_SECRETKEY || "",
      },
      region: "ap-shanghai",
    });
  }
  return cachedClient;
}

export async function invokeCloudFunction(
  functionName: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const client = getClient();
  const response = await client.Invoke({
    FunctionName: functionName,
    InvocationType: "RequestResponse",
    ClientContext: JSON.stringify(data),
  });

  const retMsg = response.Result?.RetMsg;
  if (retMsg) {
    try { return JSON.parse(retMsg); } catch {}
  }

  const errMsg = response.Result?.ErrMsg;
  if (errMsg) {
    return { code: -1, error: errMsg };
  }

  return {};
}
