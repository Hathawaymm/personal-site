const cloudbase = require("@cloudbase/node-sdk");
const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
const db = app.database();

exports.main = async (event) => {
  const { action, data } = event || {};
  try {
    const logs = db.collection("visit_logs");
    switch (action) {
      case "record": {
        const { visitorId, username, module, pageUrl } = data || {};
        await logs.add({
          visitor_id: String(visitorId || ""),
          visitor_username: username || "匿名访客",
          module_visited: module || "",
          page_url: pageUrl || "",
          created_at: new Date().toISOString(),
        });
        return { code: 0 };
      }
      case "query": {
        const result = await logs.orderBy("created_at", "desc").limit(200).get();
        return { code: 0, data: result.data };
      }
      default:
        return { code: -1, error: "未知操作: " + (action || "empty") };
    }
  } catch (err) {
    return { code: -1, error: err instanceof Error ? err.message : "服务器内部错误" };
  }
};
