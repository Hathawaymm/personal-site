"use client";

import { useState, useEffect, useCallback } from "react";
import type { SiteData, SiteSettings } from "@/lib/data";
import { compressImage } from "@/lib/compress";
import { logAdminAction } from "@/lib/adminLog";

interface AdminProfile {
  nickname: string;
  avatar: string;
  email: string;
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<SiteSettings>({ adminEmail: "", watermarkText: "" });
  const [profile, setProfile] = useState<AdminProfile>({ nickname: "", avatar: "", email: "" });
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
    try {
      const res = await fetch("/api/config?key=adminProfile");
      const p = await res.json();
      setProfile({ nickname: p?.nickname || "", avatar: p?.avatar || "", email: p?.email || "" });
    } catch {
      /* ignore */
    }
  }, [flashMsg]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!siteData || saving) return;
    setSaving(true);
    try {
      const updated: SiteData = { ...siteData, settings };
      const res = await fetch("/api/admin/site-data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
      await fetch("/api/admin/config?key=adminProfile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
      if (res.ok) {
        setSiteData(updated);
        logAdminAction("保存系统设置", `更新邮箱/水印/管理员信息`);
        flashMsg("✅ 系统设置已更新！");
      } else {
        flashMsg("保存失败");
      }
    } catch {
      flashMsg("保存失败");
    }
    setSaving(false);
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { blob, fileName } = await compressImage(file);
      const fd = new FormData();
      fd.append("file", blob, fileName);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) { setProfile({ ...profile, avatar: json.url }); flashMsg("头像已上传"); }
      else flashMsg("上传失败");
    } catch (err) {
      flashMsg(err instanceof Error ? err.message : "上传失败");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="diary-title text-xl">系统设置</h2>
      {msg && <div className="rounded-lg border border-accent-gold/30 bg-gold-strong/5 px-4 py-2 text-sm text-gold-strong">{msg}</div>}

      <div className="border-b border-accent-gold/15 pb-6">
        <h3 className="diary-title text-lg mb-4">管理员信息</h3>
        <div className="space-y-4 max-w-md">
          <div className="flex flex-col items-center gap-3">
            <div className="size-24 rounded-full bg-bg-warm overflow-hidden border-2 border-accent-gold/30">
              {profile.avatar && <img src={profile.avatar} alt="" className="w-full h-full object-cover" />}
            </div>
            <label className="cursor-pointer text-sm text-gold-strong hover:underline">
              更换头像
              <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
            </label>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">昵称</label>
            <input type="text" value={profile.nickname} onChange={e => setProfile({ ...profile, nickname: e.target.value })} className="w-full rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm text-text-primary focus:border-accent-gold/60 focus:outline-none" placeholder="管理员昵称" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">联系邮箱</label>
            <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="w-full rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm text-text-primary focus:border-accent-gold/60 focus:outline-none" placeholder="you@email.com" />
          </div>
        </div>
      </div>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm text-text-secondary mb-1">访客联系邮箱</label>
          <input type="email" value={settings.adminEmail} onChange={e => setSettings({ ...settings, adminEmail: e.target.value })} className="w-full rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm text-text-primary focus:border-accent-gold/60 focus:outline-none" placeholder="your@email.com" />
          <p className="mt-1 text-xs text-text-muted">访客点击问号图标时会看到此邮箱</p>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">图片水印文字</label>
          <input type="text" value={settings.watermarkText} onChange={e => setSettings({ ...settings, watermarkText: e.target.value })} className="w-full rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm text-text-primary focus:border-accent-gold/60 focus:outline-none" placeholder="你的昵称" />
          <p className="mt-1 text-xs text-text-muted">所有图片上的半透明水印内容</p>
        </div>
      </div>

      <button onClick={save} disabled={saving} className={`rounded-full px-6 py-2.5 text-sm font-medium text-white ${saving ? "bg-text-muted" : "bg-gold-strong hover:opacity-90"}`}>{saving ? "⏳ 保存中..." : "保存设置"}</button>
    </div>
  );
}
