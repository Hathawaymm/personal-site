const cloudbase = require("@cloudbase/node-sdk");
const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });

exports.main = async (event) => {
  const { action, fileContent, fileName, folder = "uploads" } = event || {};

  try {
    if (action === "upload") {
      if (!fileContent || !fileName) return { code: -1, error: "缺少文件内容或文件名" };
      const ext = (fileName.split(".").pop() || "").toLowerCase();
      const allowed = ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "pdf"];
      if (!allowed.includes(ext)) return { code: -1, error: "不支持的文件类型: " + ext };
      const safeName = Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
      const cloudPath = folder + "/" + safeName;
      const fileBuffer = Buffer.from(fileContent, "base64");
      const uploadRes = await app.uploadFile({ cloudPath, fileContent: fileBuffer });
      const urlRes = await app.getTempFileURL({
        fileList: [{ fileID: uploadRes.fileID, maxAge: 315360000 }],
      });
      return { code: 0, fileID: uploadRes.fileID, url: urlRes.fileList[0].tempFileURL };
    }
    if (action === "getUrl") {
      if (!event.filePath) return { code: -1, error: "缺少 filePath" };
      const maxAge = event.maxAge || 315360000;
      const fileID = "cloud://psn-site-m5-d2g6kt88h3b1d7da8.7073-psn-site-m5-d2g6kt88h3b1d7da8-1303247881/" + event.filePath;
      const urlRes = await app.getTempFileURL({
        fileList: [{ fileID, maxAge }],
      });
      return { code: 0, fileID, url: urlRes.fileList[0].tempFileURL };
    }
    return { code: -1, error: "未知操作: " + (action || "empty") };
  } catch (err) {
    return { code: -1, error: err instanceof Error ? err.message : "服务器内部错误" };
  }
};
