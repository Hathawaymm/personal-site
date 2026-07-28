const cloudbase = require("@cloudbase/node-sdk");
const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
const db = app.database();

exports.main = async (event) => {
  const { action, data } = event || {};
  try {
    const users = db.collection("users");
    switch (action) {
      case "list": {
        const { uid } = data || {};
        if (!uid) return { code: -1, error: "缺少 uid" };
        const result = await users.orderBy("created_at", "desc").limit(200).get();
        return { code: 0, data: result.data };
      }
      case "approve": {
        const { admin_uid, visitor_uid } = data || {};
        if (!admin_uid || !visitor_uid) return { code: -1, error: "缺少参数" };
        await users.where({ github_id: String(visitor_uid) }).update({ status: "approved", updated_at: new Date().toISOString() });
        return { code: 0 };
      }
      case "reject": {
        const { admin_uid, visitor_uid } = data || {};
        if (!admin_uid || !visitor_uid) return { code: -1, error: "缺少参数" };
        await users.where({ github_id: String(visitor_uid) }).update({ status: "rejected", updated_at: new Date().toISOString() });
        return { code: 0 };
      }
      default:
        return { code: -1, error: "未知操作: " + (action || "empty") };
    }
  } catch (err) {
    return { code: -1, error: err instanceof Error ? err.message : "服务器内部错误" };
  }
};
