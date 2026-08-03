"use client";

import { useState, useEffect, useCallback } from "react";

interface AdminLog {
  _id: string;
  action: string;
  detail: string;
  created_at: string;
}

export default function DashContent() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/log");
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      setMsg("加载失败");
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  return (
    <div className="space-y-6">
      <h2 className="diary-title text-xl">操作日志</h2>
      {msg && <div className="rounded bg-gold-strong/10 px-4 py-2 text-sm text-gold-strong">{msg} <button onClick={() => setMsg("")} className="ml-2">×</button></div>}
      <p className="text-sm text-text-muted">记录管理员在后台的所有关键操作，按时间倒序排列。</p>

      <div className="rounded-lg border border-accent-gold/20 bg-bg-paper p-6 shadow-paper">
        {loading ? (
          <p className="text-text-muted">加载中...</p>
        ) : logs.length === 0 ? (
          <p className="text-text-muted text-sm">暂无操作记录</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-accent-gold/20 text-left text-text-muted">
                  <th className="pb-2 pr-4 font-medium w-40">时间</th>
                  <th className="pb-2 pr-4 font-medium">操作</th>
                  <th className="pb-2 font-medium">详情</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l._id} className="border-b border-accent-gold/10 align-top">
                    <td className="py-3 pr-4 text-text-muted text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString("zh-CN")}</td>
                    <td className="py-3 pr-4 font-medium text-text-primary">{l.action}</td>
                    <td className="py-3 text-text-secondary">{l.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
