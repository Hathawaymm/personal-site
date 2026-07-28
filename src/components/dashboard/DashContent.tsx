"use client";

import { useState, useEffect, useCallback } from "react";

const TABS = ["访客管理", "日志中心", "简历编辑", "作品管理", "博客管理", "家庭编辑"] as const;
type Tab = (typeof TABS)[number];

interface UserRecord {
  _id: string;
  github_id: string;
  github_username: string;
  status: string;
  created_at: string;
}

interface LogRecord {
  _id: string;
  visitor_username: string;
  module_visited: string;
  page_url: string;
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

export default function DashContent() {
  const [tab, setTab] = useState<Tab>("访客管理");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await callFn("visitors", { action: "list", data: { uid: "admin" } });
      setUsers((res.data as UserRecord[]) || []);
    } catch { setMsg("加载失败"); }
    setLoading(false);
  }, []);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await callFn("logs", { action: "query", data: { uid: "admin" } });
      setLogs((res.data as LogRecord[]) || []);
    } catch { setMsg("加载失败"); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tab === "访客管理") loadUsers();
    if (tab === "日志中心") loadLogs();
  }, [tab, loadUsers, loadLogs]);

  const handleApprove = async (githubId: string) => {
    await callFn("visitors", { action: "approve", data: { admin_uid: "admin", visitor_uid: githubId } });
    setMsg("已通过");
    loadUsers();
  };

  const handleReject = async (githubId: string) => {
    await callFn("visitors", { action: "reject", data: { admin_uid: "admin", visitor_uid: githubId } });
    setMsg("已拒绝");
    loadUsers();
  };

  return (
    <div className="min-h-screen bg-bg-cream">
      <div className="mx-auto max-w-5xl space-y-6 px-4 pt-24 pb-8 sm:px-6">
        <h1 className="diary-title text-2xl">管理面板</h1>

        {msg && <div className="rounded bg-accent-gold/10 px-4 py-2 text-sm text-accent-gold">{msg} <button onClick={() => setMsg("")} className="ml-2">×</button></div>}

        <div className="flex gap-1 overflow-x-auto rounded-lg border border-accent-gold/20 bg-bg-paper p-1">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium ${tab === t ? "bg-accent-gold text-white" : "text-text-muted hover:text-text-primary"}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-accent-gold/20 bg-bg-paper p-6 shadow-paper">
          {loading && <p className="text-text-muted">加载中...</p>}

          {!loading && tab === "访客管理" && (
            <div className="space-y-4">
              <h2 className="diary-title text-lg">访客列表</h2>
              {users.length === 0 ? <p className="text-text-muted text-sm">暂无访客</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-accent-gold/20 text-left text-text-muted">
                        <th className="pb-2 pr-4 font-medium">GitHub 用户</th>
                        <th className="pb-2 pr-4 font-medium">GitHub ID</th>
                        <th className="pb-2 pr-4 font-medium">状态</th>
                        <th className="pb-2 pr-4 font-medium">注册时间</th>
                        <th className="pb-2 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-b border-accent-gold/10">
                          <td className="py-3 pr-4">{u.github_username}</td>
                          <td className="py-3 pr-4 text-text-muted text-xs">{u.github_id}</td>
                          <td className="py-3 pr-4">
                            <span className={`rounded-full px-2 py-0.5 text-xs ${u.status === "approved" ? "bg-accent-sage/20 text-accent-sage" : u.status === "rejected" ? "bg-accent-rose/20 text-accent-rose" : "bg-accent-gold/20 text-accent-gold"}`}>
                              {u.status === "approved" ? "已通过" : u.status === "rejected" ? "已拒绝" : "待审批"}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-text-muted text-xs">{new Date(u.created_at).toLocaleDateString("zh-CN")}</td>
                          <td className="py-3">
                            {u.status !== "approved" && <button onClick={() => handleApprove(u.github_id)} className="mr-2 text-xs text-accent-sage hover:underline">通过</button>}
                            {u.status !== "rejected" && <button onClick={() => handleReject(u.github_id)} className="text-xs text-accent-rose hover:underline">拒绝</button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!loading && tab === "日志中心" && (
            <div className="space-y-4">
              <h2 className="diary-title text-lg">访问日志</h2>
              {logs.length === 0 ? <p className="text-text-muted text-sm">暂无日志</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-accent-gold/20 text-left text-text-muted">
                        <th className="pb-2 pr-4 font-medium">用户</th>
                        <th className="pb-2 pr-4 font-medium">访问模块</th>
                        <th className="pb-2 pr-4 font-medium">页面</th>
                        <th className="pb-2 font-medium">时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((l) => (
                        <tr key={l._id} className="border-b border-accent-gold/10">
                          <td className="py-3 pr-4">{l.visitor_username}</td>
                          <td className="py-3 pr-4">{l.module_visited}</td>
                          <td className="py-3 pr-4 text-text-muted text-xs">{l.page_url}</td>
                          <td className="py-3 text-text-muted text-xs">{new Date(l.created_at).toLocaleString("zh-CN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!loading && tab !== "访客管理" && tab !== "日志中心" && (
            <div className="text-center py-12 space-y-4">
              <p className="text-text-muted">内容编辑请前往经典管理面板</p>
              <a href="/admin" className="inline-block rounded-full bg-accent-gold px-6 py-3 text-sm font-medium text-white hover:opacity-90">
                打开管理面板 →
              </a>
              <p className="text-xs text-text-muted">支持编辑: 站点信息 / 简历 / 作品 / 家庭成员 / 照片墙</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
