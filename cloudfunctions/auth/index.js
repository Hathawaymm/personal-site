const cloudbase = require("@cloudbase/node-sdk");
const https = require("https");

const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
const db = app.database();

const HTTP_TIMEOUT = 15000;

function httpRequest(method, url, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method,
      headers,
      timeout: HTTP_TIMEOUT,
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
      });
    });
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("HTTP 请求超时"));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function httpPost(url, headers, body) {
  return httpRequest("POST", url, headers, body);
}

function httpGet(url, headers) {
  return httpRequest("GET", url, headers);
}

exports.main = async (event) => {
  const { action, data } = event;

  try {
    switch (action) {
      case "onLogin": {
        const { uid, username, avatarUrl, email, adminGithubId } = data || {};
        if (!uid) return { code: -1, error: "缺少 uid" };

        const users = db.collection("users");
        const existing = await users.where({ github_id: String(uid) }).get();
        const isAdmin = adminGithubId ? String(uid) === String(adminGithubId) : false;

        if (existing.data.length === 0) {
          await users.add({
            github_id: String(uid),
            github_username: username || "",
            nickname: username || "",
            avatar_url: avatarUrl || "",
            email: email || "",
            is_admin: isAdmin,
            status: isAdmin ? "approved" : "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          const updateFields = {
            github_username: username || existing.data[0].github_username,
            avatar_url: avatarUrl || existing.data[0].avatar_url,
            email: email || existing.data[0].email,
            updated_at: new Date().toISOString(),
          };
          if (isAdmin) {
            updateFields.is_admin = true;
            updateFields.status = "approved";
          }
          await users.where({ github_id: String(uid) }).update(updateFields);
        }

        const user = await users.where({ github_id: String(uid) }).get();
        return { code: 0, user: user.data[0] };
      }

      case "exchangeCode": {
        const { code, clientId, clientSecret } = data || {};
        if (!code) return { code: -1, error: "缺少 code" };
        if (!clientId || !clientSecret) return { code: -1, error: "缺少 OAuth 配置" };

        const tokenData = await httpPost(
          "https://github.com/login/oauth/access_token",
          { "Content-Type": "application/json", Accept: "application/json" },
          JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
        );

        if (tokenData.error) {
          return { code: -1, error: tokenData.error_description || "GitHub token 交换失败" };
        }

        if (!tokenData.access_token) {
          return { code: -1, error: "GitHub 返回异常：缺少 access_token" };
        }

        const userData = await httpGet("https://api.github.com/user", {
          Authorization: `Bearer ${tokenData.access_token}`,
          "User-Agent": "psn-site",
        });

        if (!userData || !userData.id) {
          return { code: -1, error: "获取 GitHub 用户信息失败" };
        }

        return {
          code: 0,
          user: {
            gid: String(userData.id),
            login: userData.login || "",
            avatar: userData.avatar_url || "",
            email: userData.email || "",
          },
        };
      }

      case "getCurrentUser": {
        const { uid } = data || {};
        if (!uid) return { code: -1, error: "缺少 uid" };

        const user = await db.collection("users").where({ github_id: String(uid) }).get();
        return { code: 0, user: user.data[0] || null };
      }

      case "isAdmin": {
        const { uid } = data || {};
        if (!uid) return { code: -1, error: "缺少 uid" };

        const user = await db.collection("users").where({ github_id: String(uid) }).get();
        return { code: 0, is_admin: user.data[0]?.is_admin === true };
      }

      case "checkInit": {
        const admins = await db.collection("users").where({ is_admin: true }).limit(1).get();
        return { code: 0, hasAdmin: admins.data.length > 0 };
      }

      default:
        return { code: -1, error: "未知操作: " + (action || "empty") };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "服务器内部错误";
    console.error("Cloud function error:", message, "action:", action);
    return { code: -1, error: message };
  }
};
