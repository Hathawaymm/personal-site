const cloudbase = require("@cloudbase/node-sdk");
const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
const db = app.database();

const DEFAULT_DATA = {
  title: "欢迎来到我的空间，我的朋友",
  subtitle: "用镜头记录每一个温暖日常",
  resume: { avatar: "", name: "", bio: "", experience: [], education: [], skills: [] },
  family: [], photos: [], works: [],
  settings: { adminEmail: "", watermarkText: "Hathawaymm" },
};

exports.main = async (event) => {
  const { action, data } = event || {};
  try {
    const site = db.collection("site");
    const config = db.collection("config");

    if (action === "get") {
      const docs = await site.where({ key: "main" }).get();
      return { code: 0, data: docs.data.length > 0 ? docs.data[0].value : DEFAULT_DATA };
    }

    if (action === "put") {
      if (!data) return { code: -1, error: "缺少 data" };
      const docs = await site.where({ key: "main" }).get();
      if (docs.data.length > 0) {
        await site.doc(docs.data[0]._id).update({ value: data, updated_at: new Date().toISOString() });
      } else {
        await site.add({ key: "main", value: data, updated_at: new Date().toISOString() });
      }
      return { code: 0 };
    }

    if (action === "getConfig") {
      const { configKey = "homepage" } = event;
      const docs = await config.where({ key: configKey }).get();
      return { code: 0, data: docs.data.length > 0 ? docs.data[0].value : null };
    }

    if (action === "putConfig") {
      if (!data) return { code: -1, error: "缺少 data" };
      const { configKey = "homepage" } = event;
      const docs = await config.where({ key: configKey }).get();
      if (docs.data.length > 0) {
        await config.doc(docs.data[0]._id).update({ value: data, updated_at: new Date().toISOString() });
      } else {
        await config.add({ key: configKey, value: data, updated_at: new Date().toISOString() });
      }
      return { code: 0 };
    }

    return { code: -1, error: "未知操作: " + (action || "empty") };
  } catch (err) {
    return { code: -1, error: err instanceof Error ? err.message : "服务器内部错误" };
  }
};
