"use client";

import { useState, useEffect, useCallback } from "react";
import type { SiteData, SiteSettings, FooterConfig, FooterLink } from "@/lib/data";
import { DEFAULT_FOOTER } from "@/lib/data";

export default function SystemSettings() {
  const [settings, setSettings] = useState<SiteSettings>({ adminEmail: "", watermarkText: "" });
  const [footer, setFooter] = useState<FooterConfig>(DEFAULT_FOOTER);
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
      setFooter({ ...DEFAULT_FOOTER, ...(data.footer || {}) });
    } catch {
      flashMsg("加载失败");
    }
  }, [flashMsg]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!siteData || saving) return;
    setSaving(true);
    try {
      const updated: SiteData = { ...siteData, settings, footer };
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

  const updateLinks = (type: "siteLinks" | "socialLinks", idx: number, field: keyof FooterLink, value: string) => {
    setFooter(prev => {
      const list = [...(prev[type] || [])];
      list[idx] = { ...list[idx], [field]: value };
      return { ...prev, [type]: list };
    });
  };

  const addLink = (type: "siteLinks" | "socialLinks") => {
    setFooter(prev => ({ ...prev, [type]: [...(prev[type] || []), { label: "", href: "" }] }));
  };

  const removeLink = (type: "siteLinks" | "socialLinks", idx: number) => {
    setFooter(prev => ({ ...prev, [type]: (prev[type] || []).filter((_, i) => i !== idx) }));
  };

  const linkInputs = (type: "siteLinks" | "socialLinks") => (
    <div className="space-y-2">
      {(footer[type] || []).map((link, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            type="text"
            value={link.label}
            onChange={e => updateLinks(type, idx, "label", e.target.value)}
            className="w-32 rounded border border-accent-gold/20 bg-bg-paper px-2 py-1.5 text-sm text-text-primary focus:outline-none"
            placeholder="名称"
          />
          <input
            type="text"
            value={link.href}
            onChange={e => updateLinks(type, idx, "href", e.target.value)}
            className="flex-1 rounded border border-accent-gold/20 bg-bg-paper px-2 py-1.5 text-sm text-text-primary focus:outline-none"
            placeholder="https://..."
          />
          <button onClick={() => removeLink(type, idx)} className="text-xs text-accent-rose hover:underline">删除</button>
        </div>
      ))}
      <button onClick={() => addLink(type)} className="rounded-full border border-accent-gold/30 px-3 py-1 text-xs text-accent-gold hover:bg-accent-gold/5">+ 添加链接</button>
    </div>
  );

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

      <div className="border-t border-accent-gold/15 pt-6">
        <h3 className="diary-title text-lg mb-4">底部信息</h3>
        <div className="space-y-5 max-w-md">
          <div>
            <label className="block text-sm text-text-secondary mb-1">底部描述文字</label>
            <textarea value={footer.tagline} onChange={e => setFooter({ ...footer, tagline: e.target.value })} rows={3} className="w-full rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm text-text-primary focus:border-accent-gold/60 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">版权署名</label>
            <input type="text" value={footer.copyright} onChange={e => setFooter({ ...footer, copyright: e.target.value })} className="w-full rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm text-text-primary focus:border-accent-gold/60 focus:outline-none" placeholder="我们的时光" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Navigate 导航链接</label>
            {linkInputs("siteLinks")}
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Connect 社交链接</label>
            {linkInputs("socialLinks")}
          </div>
        </div>
      </div>

      <button onClick={save} disabled={saving} className={`rounded-full px-6 py-2.5 text-sm font-medium text-white ${saving ? "bg-text-muted" : "bg-accent-gold hover:opacity-90"}`}>{saving ? "⏳ 保存中..." : "保存设置"}</button>
    </div>
  );
}
