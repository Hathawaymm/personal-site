const CloudBase = require("@cloudbase/manager-node/lib/index");

const envId = process.env.TCB_ENV_ID || "psn-site-m5-d2g6kt88h3b1d7da8";
const secretId = process.env.TCB_SECRET_ID;
const secretKey = process.env.TCB_SECRET_KEY;

async function main() {
  const action = process.argv[2];
  const payload = JSON.parse(process.argv[3] || "{}");

  if (!secretId || !secretKey) {
    console.error(JSON.stringify({ error: "缺少 TCB_SECRET_ID 或 TCB_SECRET_KEY 环境变量" }));
    process.exit(1);
  }

  const manager = CloudBase.init({ envId, secretId, secretKey });

  if (action === "invoke") {
    const { functionName, data } = payload;
    const res = await manager.functions.invokeFunction(functionName, data);
    console.log(JSON.stringify(res));
  } else {
    console.error(JSON.stringify({ error: `未知操作: ${action}` }));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
});
