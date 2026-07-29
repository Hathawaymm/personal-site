"use client";

import { useState, useEffect, useCallback } from "react";
import { PERMISSION_LABELS, ALL_PERMISSIONS, TEXT_ONLY_PERMISSIONS, type Permissions } from "@/lib/permissions";
import { useAuth } from "@/contexts/AuthContext";

interface UserRecord {
  _id: string;
  github_id: string;
  github_username: string;
  nickname: string;
  status: string;
  created_at: string;
}

async function callFn(name: string, data: Record<string, unknown>) {
  const res = await fetch(`https://psn-site-m5-d2g6kt88h3b1d7da8.ap-shanghai.tcb-api.tencentcloudapi.com/web?name=${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  return json.result || json;
}

export default function VisitorManager() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [permModal, setPermModal] = useState<{ user: UserRecord; permissions: Permissions; saving: boolean } | null>(null);
  const [rejectedOpen, setRejectedOpen] = useState(false);
  const { githubUser } = useAuth();

  const adminUid = githubUser?.gid || "admin";

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await callFn("visitors", { action: "list", data: { uid: adminUid } });
      const data = (res.data as UserRecord[]) || [];
      setUsers(data.filter((u: UserRecord) => u.status !== "rejected"));
    } catch {
      setMsg("加载失败");
    }
    setLoading(false);
  }, []);

  const loadRejected = useCallback(async () => {
    try {
      const res = await callFn("visitors", { action: "list", data: { uid: adminUid, filter: "rejected" } });
      const data = (res.data as UserRecord[]) || [];
      return data.filter((u: UserRecord) => u.status === "rejected");
    } catch {
      setMsg("加载已拒绝列表失败");
      return [];
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers, adminUid]);

  const openPermModal = async (user: UserRecord) => {
    setLoading(true);
    try {
      const res = await callFn("permissions", { action: "get", data: { uid: user.github_id } });
      const perms = (res.permissions as Record<string, boolean>) || {};
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
      await callFn("permissions", {
        action: "update",
        data: {
          admin_uid: adminUid,
          visitor_uid: permModal.user.github_id,
          modules: permModal.permissions,
        },
      });
      setMsg(`✅ ${permModal.user.github_username} 的权限已保存`);
      setPermModal(null);
      loadUsers();
    } catch {
      setMsg("保存失败");
      setPermModal({ ...permModal, saving: false });
    }
  };

  const handleReject = async (githubId: string) => {
    try {
      await callFn("visitors", { action: "reject", data: { admin_uid: adminUid, visitor_uid: githubId } });
      setMsg("已拒绝");
      loadUsers();
    } catch {
      setMsg("操作失败，请重试");
    }
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
