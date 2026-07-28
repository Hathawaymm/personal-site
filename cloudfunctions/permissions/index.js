const cloudbase = require("@cloudbase/node-sdk");

const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
const db = app.database();

exports.main = async (event) => {
  const { action, data } = event || {};

  try {
    const perms = db.collection("permissions");
    const users = db.collection("users");

    switch (action) {
      case "get": {
        const { uid } = data || {};
        if (!uid) return { code: -1, error: "缺少 uid" };

        const record = await perms.where({ visitor_github_id: String(uid) }).get();
        const user = await users.where({ github_id: String(uid) }).get();
        return {
          code: 0,
          permissions: record.data[0]?.modules || {},
          status: user.data[0]?.status || "pending",
          is_admin: user.data[0]?.is_admin === true,
        };
      }

      case "update": {
        const { admin_uid, visitor_uid, modules } = data || {};
        if (!admin_uid || !visitor_uid) return { code: -1, error: "缺少参数" };

        const admin = await users.where({ github_id: String(admin_uid) }).get();
        if (!admin.data[0]?.is_admin) return { code: 403, error: "无权限" };

        const existing = await perms.where({ visitor_github_id: String(visitor_uid) }).get();
        if (existing.data.length > 0) {
          await perms.doc(existing.data[0]._id).update({
            modules,
            admin_id: admin.data[0]._id,
            updated_at: new Date().toISOString(),
          });
        } else {
          await perms.add({
            visitor_github_id: String(visitor_uid),
            visitor_id: "",
            admin_id: admin.data[0]._id,
            modules,
            granted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        await users.where({ github_id: String(visitor_uid) }).update({
          status: "approved",
          updated_at: new Date().toISOString(),
        });

        return { code: 0 };
      }

      default:
        return { code: -1, error: "未知操作: " + (action || "empty") };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "服务器内部错误";
    console.error("Permissions cloud function error:", message, "action:", action);
    return { code: -1, error: message };
  }
};
