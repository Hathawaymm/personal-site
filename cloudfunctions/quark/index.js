const axios = require("axios");
const COS = require("cos-nodejs-sdk-v5");

const STATIC_BUCKET = "d793-static-psn-site-m5-d2g6kt88h3b1d7da8-1303247881";
const STATIC_REGION = "ap-shanghai";
const STATIC_DOMAIN = "https://psn-site-m5-d2g6kt88h3b1d7da8-1303247881.tcloudbaseapp.com";
const QUARK_HOST = "https://drive-pc.quark.cn";
const THUMB_PREFIX = "thumbnails/";

function getCookie() {
  return process.env.QUARK_COOKIE || "";
}

function headers() {
  return {
    Cookie: getCookie(),
    Referer: "https://pan.quark.cn/",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
  };
}

function getCos() {
  return new COS({
    SecretId: process.env.COS_SECRET_ID || "",
    SecretKey: process.env.COS_SECRET_KEY || "",
  });
}

function headObject(key) {
  return new Promise((resolve) => {
    getCos().headObject({ Bucket: STATIC_BUCKET, Region: STATIC_REGION, Key: key }, (err) => resolve(!err));
  });
}

function putBuffer(key, buffer, contentType) {
  return new Promise((resolve, reject) => {
    getCos().putObject(
      { Bucket: STATIC_BUCKET, Region: STATIC_REGION, Key: key, Body: buffer, ContentType: contentType || "image/jpeg" },
      (err) => (err ? reject(err) : resolve())
    );
  });
}

// 并发控制：将任务分批执行，每批 concurrency 个
async function mapLimit(items, concurrency, fn) {
  const results = new Array(items.length);
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i], i);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

exports.main = async (event) => {
  const { action, pdir_fid = "0", fids = [] } = event || {};
  const page = Math.max(1, parseInt(event.page, 10) || 1);
  const size = Math.min(50, Math.max(1, parseInt(event.size, 10) || 20));
  try {
    if (action === "list") {
      const res = await axios.get(`${QUARK_HOST}/1/clouddrive/file/sort`, {
        params: {
          pr: "ucpro", fr: "pc", uc_param_str: "",
          pdir_fid, _page: page, _size: size, _fetch_total: 1,
          _sort: "file_type:asc,updated_at:desc",
          fetch_all_file: 1, fetch_risk_file_name: 1,
        },
        headers: headers(),
        timeout: 15000,
      });
      const d = res.data;
      if (d.status !== 200 && d.code !== 0) {
        return { code: -1, error: "夸克接口异常: " + (d.message || d.code), cookieInvalid: true };
      }
      const data = d.data || {};
      const list = data.list || [];
      const files = list.map(f => ({
        fid: f.fid,
        name: f.file_name,
        dir: !!f.dir,
        size: f.size || 0,
        category: f.category || 0,
      }));
      // 夸克接口不返回总数，用"本页满员则可能还有下一页"近似判断
      const hasMore = files.length >= size;
      return { code: 0, data: { files, parent: pdir_fid, page, hasMore } };
    }

    if (action === "download") {
      if (!fids || !fids.length) return { code: -1, error: "缺少 fids" };
      const dlRes = await axios.post(
        `${QUARK_HOST}/1/clouddrive/file/download?pr=ucpro&fr=pc&uc_param_str=&__t=${Date.now()}`,
        { fids, pr: "ucpro", fr: "pc" },
        { headers: headers(), timeout: 15000 }
      );
      const dlData = dlRes.data;
      if (dlData.status !== 200 || !dlData.data || !dlData.data[0]) {
        return { code: -1, error: "获取下载链接失败: " + (dlData.message || dlData.code), cookieInvalid: true };
      }
      const info = dlData.data[0];
      const url = info.download_url;
      const fileName = info.file_name || `quark-${Date.now()}`;
      const ext = (fileName.split(".").pop() || "jpg").toLowerCase();
      const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const resp = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 120000,
        maxRedirects: 5,
        headers: { Cookie: getCookie(), Referer: "https://pan.quark.cn/", "User-Agent": headers()["User-Agent"] },
      });
      const buffer = Buffer.from(resp.data);
      await putBuffer(key, buffer, "application/octet-stream");
      return { code: 0, data: { url: `${STATIC_DOMAIN}/${key}`, fileName } };
    }

    if (action === "thumbs") {
      if (!fids || !fids.length) return { code: 0, data: { urls: {} } };
      const urls = {};
      await mapLimit(fids, 5, async (fid) => {
        if (!fid) return;
        const key = `${THUMB_PREFIX}${fid}.jpg`;
        const cosUrl = `${STATIC_DOMAIN}/${key}`;
        const exists = await headObject(key);
        if (exists) {
          urls[fid] = cosUrl;
          return;
        }
        try {
          const resp = await axios.get(`${QUARK_HOST}/1/clouddrive/file/thumbnail?fid=${fid}`, {
            responseType: "arraybuffer",
            timeout: 15000,
            headers: headers(),
          });
          if (resp.status === 200 && resp.data) {
            await putBuffer(key, Buffer.from(resp.data), "image/jpeg");
            urls[fid] = cosUrl;
          }
        } catch (e) {
          if (e.response && (e.response.status === 401 || e.response.status === 403)) {
            throw new Error("cookieInvalid");
          }
          // 单个缩略图失败不影响其他
        }
      });
      return { code: 0, data: { urls } };
    }

    if (action === "health") {
      try {
        const res = await axios.get(`${QUARK_HOST}/1/clouddrive/member`, {
          params: { pr: "ucpro", fr: "pc", uc_param_str: "" },
          headers: headers(),
          timeout: 10000,
        });
        const ok = !!(res.data && res.data.status === 200);
        return { code: 0, data: { valid: ok, updatedAt: new Date().toISOString() } };
      } catch {
        return { code: 0, data: { valid: false, updatedAt: new Date().toISOString() } };
      }
    }

    return { code: -1, error: "未知操作: " + (action || "empty") };
  } catch (err) {
    if (err && err.message === "cookieInvalid") {
      return { code: -1, error: "夸克 Cookie 已过期", cookieInvalid: true };
    }
    const msg = err instanceof Error ? err.message : "服务器内部错误";
    return { code: -1, error: msg };
  }
};
