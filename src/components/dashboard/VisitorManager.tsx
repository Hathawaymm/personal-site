"use client";

import { useState, useEffect, useCallback } from "react";
import { PERMISSION_LABELS, ALL_PERMISSIONS, TEXT_ONLY_PERMISSIONS, type Permissions } from "@/lib/permissions";
import { useAuth } from "@/contexts/AuthContext";
import { logAdminAction } from "@/lib/adminLog";

interface UserRecord {
  _id: string;
  github_id: string;
  github_username: string;
  nickname: string;
  status: string;
  created_at: string;
}

interface VisitLog {
  _id: string;
  visitor_id: string;
  visitor_username: string;
  module_visited: string;
  page_url: string;
  created_at: string;
}

async function callApi(path: string, method: string, body?: Record<string, unknown>) {
  const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  return await res.json();
}

export default function VisitorManager() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [permModal, setPermModal] = useState<{ user: UserRecord; permissions: Permissions; saving: boolean } | null>(null);
  const [rejectedOpen, setRejectedOpen] = useState(false);
  const [visitTab, setVisitTab] = useState<"users" | "logs">("users");
  const [visitLogs, setVisitLogs] = useState<VisitLog[]>([]);
  const { githubUser } = useAuth();

  const adminUid = githubUser?.gid || "admin";

  const loadVisitLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/visit-log");
      const data = await res.json();
      setVisitLogs(Array.isArray(data) ? data : []);
    } catch {
      setMsg("加载浏览日志失败");
    }
  }, []);

  useEffect(() => {
    if (visitTab === "logs") loadVisitLogs();
  }, [visitTab, loadVisitLogs]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/visitors");
      const data = await res.json();
      const users = Array.isArray(data) ? data : (data.data || []);
      setUsers(users.filter((u: UserRecord) => u.status !== "rejected"));
    } catch {
      setMsg("加载失败");
    }
    setLoading(false);
  }, []);

  const loadRejected = useCallback(async () => {
    try {
      const res = await fetch("/api/visitors");
      const data = await res.json();
      const users = Array.isArray(data) ? data : (data.data || []);
      return users.filter((u: UserRecord) => u.status === "rejected");
    } catch {
      setMsg("加载已拒绝列表失败");
      return [];
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers, adminUid]);

  const openPermModal = async (user: UserRecord) => {
    setLoading(true);
    try {
      const res = await fetch("/api/permissions?uid=" + user.github_id);
      const perms = await res.json();
      setPermModal({
        user,
        permissions: {
          resume_text: perms.resume_text === true,
          resume_photo: perms.resume_photo === true,
          portfolio: perms.portfolio === true,
          blog: perms.blog === true,
          family: perms.family === true,
          photos: perms.photos === true,
        },
        saving: false,
      });
    } catch {
      setPermModal({
        user,
        permissions: { resume_text: false, resume_photo: false, portfolio: false, blog: false, family: false, photos: false },
        saving: false,
      });
    }
    setLoading(false);
  };

  const togglePerm = (key: keyof Permissions) => {
    if (!permModal) return;
    setPermModal({
      ...permModal,
      permissions: { ...permModal.permissions, [key]: !permModal.permissions[key] },
    });
  };

  const setAllPerms = (type: "all" | "text" | "none") => {
    if (!permModal) return;
    const newPerms: Permissions = { resume_text: false, resume_photo: false, portfolio: false, blog: false, family: false, photos: false };
    if (type === "all") {
      ALL_PERMISSIONS.forEach(k => { newPerms[k] = true; });
    } else if (type === "text") {
      TEXT_ONLY_PERMISSIONS.forEach(k => { newPerms[k] = true; });
    }
    setPermModal({ ...permModal, permissions: newPerms });
  };

  const savePermissions = async () => {
    if (!permModal) return;
    setPermModal({ ...permModal, saving: true });
    try {
      const res = await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitor_uid: permModal.user.github_id,
          modules: permModal.permissions,
        }),
      });
      const result = await res.json();
      if (!result.error) {
        setMsg(`✅ ${permModal.user.github_username} 的权限已保存`);
        logAdminAction("修改访客权限", `为 ${permModal.user.github_username} 更新权限`);
        setPermModal(null);
        loadUsers();
      } else {
        setMsg("保存失败: " + result.error);
        setPermModal({ ...permModal, saving: false });
      }
    } catch {
      setMsg("保存失败");
      setPermModal({ ...permModal, saving: false });
    }
  };

  const handleReject = async (githubId: string) => {
    try {
      const res = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", visitor_uid: githubId }),
      });
      const result = await res.json();
      if (!result.error) { setMsg("已拒绝"); loadUsers(); } else { setMsg("操作失败"); }
    } catch { setMsg("操作失败，请重试"); }
  };

  const pendingUsers = users.filter(u => u.status === "pending");
  const approvedUsers = users.filter(u => u.status === "approved");

  return (
    <div className="space-y-8">
      {msg && (
        <div className="rounded-lg border border-accent-gold/30 bg-accent-gold/5 px-4 py-2 text-sm text-accent-gold">
          {msg}
          <button className="ml-3 text-xs underline" onClick={() => setMsg("")}>关闭</button>
        </div>
      )}

      <div className="flex gap-1 rounded-lg border border-accent-gold/20 bg-bg-paper p-1 max-w-md">
        <button onClick={() => setVisitTab("users")} className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${visitTab === "users" ? "bg-accent-gold text-white" : "text-text-muted hover:text-text-primary"}`}>访客管理</button>
        <button onClick={() => setVisitTab("logs")} className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${visitTab === "logs" ? "bg-accent-gold text-white" : "text-text-muted hover:text-text-primary"}`}>访客浏览日志</button>
      </div>

      {visitTab === "logs" ? (
        <section>
          <h2 className="diary-title text-xl mb-4">访客浏览日志</h2>
          {visitLogs.length === 0 ? (
            <p className="text-text-muted caption-text">暂无浏览记录</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-accent-gold/20 bg-bg-paper p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-accent-gold/20 text-left text-text-muted">
                    <th className="pb-2 pr-4 font-medium">访客ID</th>
                    <th className="pb-2 pr-4 font-medium">访客昵称</th>
                    <th className="pb-2 pr-4 font-medium">访问板块</th>
                    <th className="pb-2 pr-4 font-medium">页面URL</th>
                    <th className="pb-2 font-medium">访问时间</th>
                  </tr>
                </thead>
                <tbody>
                  {visitLogs.map((l) => (
                    <tr key={l._id} className="border-b border-accent-gold/10">
                      <td className="py-3 pr-4 text-text-muted text-xs">{l.visitor_id}</td>
                      <td className="py-3 pr-4">{l.visitor_username}</td>
                      <td className="py-3 pr-4">{l.module_visited}</td>
                      <td className="py-3 pr-4 text-text-muted text-xs">{l.page_url}</td>
                      <td className="py-3 text-text-muted text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString("zh-CN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        <>

      <section>
        <h2 className="diary-title text-xl mb-4">待审批列表</h2>
        {pendingUsers.length === 0 ? (
          <p className="text-text-muted caption-text">🎉 暂无待审批的人，清净~</p>
        ) : (
          <div className="space-y-3">
            {pendingUsers.map(user => (
              <div key={user._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent-gold/20 bg-bg-paper p-4">
                <div>
                  <span className="font-medium text-text-primary">{user.github_username || user.nickname}</span>
                  <span className="ml-2 text-xs text-text-muted">{user.status}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openPermModal(user)} className="rounded-full bg-accent-gold px-4 py-1.5 text-sm text-white hover:opacity-90">
                    ✅ 批准并配置权限
                  </button>
                  <button onClick={() => handleReject(user.github_id)} className="rounded-full border border-accent-rose/30 px-4 py-1.5 text-sm text-accent-rose hover:bg-accent-rose/5">
                    ❌ 拒绝申请
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="diary-title text-xl mb-4">已授权列表</h2>
        {approvedUsers.length === 0 ? (
          <p className="text-text-muted caption-text">📭 暂无已审批的访客</p>
        ) : (
          <div className="space-y-3">
            {approvedUsers.map(user => (
              <div key={user._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent-sage/20 bg-bg-paper p-4">
                <div className="flex-1">
                  <span className="font-medium text-text-primary">{user.github_username || user.nickname}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openPermModal(user)} className="rounded-full border border-accent-gold/30 px-3 py-1.5 text-sm text-accent-gold hover:bg-accent-gold/5">
                    ✏ 修改权限
                  </button>
                  <button onClick={() => handleReject(user.github_id)} className="rounded-full border border-accent-rose/30 px-3 py-1.5 text-sm text-accent-rose hover:bg-accent-rose/5">
                    🗑 移除访问
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <button
          onClick={async () => {
            const list = await loadRejected();
            setRejectedOpen(!rejectedOpen);
          }}
          className="text-sm text-text-muted hover:text-text-primary underline"
        >
          {rejectedOpen ? "收起" : "展开"}已拒绝列表
        </button>
        {/* Rejected list collapsed by default for simplicity */}
      </section>

        </>
      )}

      {permModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !permModal.saving && setPermModal(null)}>
          <div className="w-full max-w-md rounded-lg bg-bg-paper p-6 shadow-paper-hover" onClick={e => e.stopPropagation()}>
            <h3 className="diary-title text-lg mb-4">
              配置权限：{permModal.user.github_username}
            </h3>

            <div className="space-y-3">
              {ALL_PERMISSIONS.map(key => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permModal.permissions[key]}
                    onChange={() => togglePerm(key)}
                    className="h-4 w-4 rounded accent-accent-gold"
                  />
                  <span className="text-sm text-text-secondary">{PERMISSION_LABELS[key]}</span>
                </label>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => setAllPerms("all")} className="rounded-full border border-accent-gold/30 px-3 py-1 text-xs text-accent-gold">全选</button>
              <button onClick={() => setAllPerms("text")} className="rounded-full border border-accent-sky/30 px-3 py-1 text-xs text-accent-sky">仅选文字</button>
              <button onClick={() => setAllPerms("none")} className="rounded-full border border-accent-rose/30 px-3 py-1 text-xs text-accent-rose">清空全部</button>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setPermModal(null)} className="rounded-full border border-accent-gold/30 px-4 py-2 text-sm text-text-muted">
                取消
              </button>
              <button
                onClick={savePermissions}
                disabled={permModal.saving}
                className={`rounded-full px-4 py-2 text-sm text-white ${permModal.saving ? "bg-text-muted" : "bg-accent-gold hover:opacity-90"}`}
              >
                {permModal.saving ? "⏳ 正在保存..." : "✅ 保存此访客权限"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && <p className="text-text-muted text-sm">加载中...</p>}
    </div>
  );
}
