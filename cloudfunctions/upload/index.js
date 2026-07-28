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
      const cloudPath = folder + "/" + Date.now() + "-" + fileName;
      const uploadRes = await app.uploadFile({ cloudPath, fileContent });
      const urlRes = await app.getTempFileURL({ fileList: [uploadRes.fileID] });
      return { code: 0, fileID: uploadRes.fileID, url: urlRes.fileList[0].tempFileURL };
    }
    return { code: -1, error: "未知操作: " + (action || "empty") };
  } catch (err) {
    return { code: -1, error: err instanceof Error ? err.message : "服务器内部错误" };
  }
};
