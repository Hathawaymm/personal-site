"use client";

import { useState, useEffect, useCallback } from "react";
import type { SiteData, SiteSettings } from "@/lib/data";

export default function SystemSettings() {
  const [settings, setSettings] = useState<SiteSettings>({ adminEmail: "", watermarkText: "" });
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const flashMsg = useCallback((text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(m => m === text ? "" : m), 4000);
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/site-data");
      const data: SiteData = await res.json();
      setSiteData(data);
      setSettings(data.settings || { adminEmail: "", watermarkText: "" });
    } catch {
      flashMsg("加载失败");
    }
  }, [flashMsg]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!siteData || saving) return;
    setSaving(true);
    try {
      const updated: SiteData = { ...siteData, settings };
      const res = await fetch("/api/admin/site-data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
      if (res.ok) {
        setSiteData(updated);
        flashMsg("✅ 系统设置已更新！");
      } else {
        flashMsg("保存失败");
      }
    } catch {
      flashMsg("保存失败");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="diary-title text-xl">系统设置</h2>
      {msg && <div className="rounded-lg border border-accent-gold/30 bg-accent-gold/5 px-4 py-2 text-sm text-accent-gold">{msg}</div>}
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm text-text-secondary mb-1">管理员联系邮箱</label>
          <input type="email" value={settings.adminEmail} onChange={e => setSettings({ ...settings, adminEmail: e.target.value })} className="w-full rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm text-text-primary focus:border-accent-gold/60 focus:outline-none" placeholder="your@email.com" />
          <p className="mt-1 text-xs text-text-muted">访客点击问号图标时会看到此邮箱</p>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">图片水印文字</label>
          <input type="text" value={settings.watermarkText} onChange={e => setSettings({ ...settings, watermarkText: e.target.value })} className="w-full rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm text-text-primary focus:border-accent-gold/60 focus:outline-none" placeholder="你的昵称" />
          <p className="mt-1 text-xs text-text-muted">所有图片上的半透明水印内容</p>
        </div>
      </div>
      <button onClick={save} disabled={saving} className={`rounded-full px-6 py-2.5 text-sm font-medium text-white ${saving ? "bg-text-muted" : "bg-accent-gold hover:opacity-90"}`}>{saving ? "⏳ 保存中..." : "保存设置"}</button>
    </div>
  );
}
