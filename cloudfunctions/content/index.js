const cloudbase = require("@cloudbase/node-sdk");

const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
const db = app.database();

exports.main = async (event) => {
  const type = (event && event.type) || (event && event.data && event.data.type);
  const action = (event && event.action) || (event && event.data && event.data.action);
  const id = (event && event.id) || (event && event.data && event.data.id);
  const itemData = (event && event.data) || event;
  const collection = db.collection("content");

  try {
    switch (action) {
      case "get": {
        if (type) {
          const docs = await collection.where({ type }).orderBy("sort_order", "asc").get();
          return { code: 0, data: docs.data };
        }
        if (id) {
          const doc = await collection.doc(id).get();
          return { code: 0, data: doc.data[0] || null };
        }
        return { code: -1, error: "缺少 type 或 id" };
      }

      case "save": {
        if (!type || !itemData) return { code: -1, error: "缺少 type 或 data" };
        const item = { ...itemData, type, updated_at: new Date().toISOString() };
        if (id) {
          await collection.doc(id).update(item);
          return { code: 0, id };
        }
        const res = await collection.add({
          ...item,
          created_at: new Date().toISOString(),
        });
        return { code: 0, id: res.id };
      }

      case "delete": {
        if (!id) return { code: -1, error: "缺少 id" };
        await collection.doc(id).remove();
        return { code: 0 };
      }

      default:
        return { code: -1, error: "未知操作: " + (action || "empty") };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "服务器内部错误";
    console.error("Content cloud function error:", message, "action:", action);
    return { code: -1, error: message };
  }
};
