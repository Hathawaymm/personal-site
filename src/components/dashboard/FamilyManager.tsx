"use client";

import { useState, useEffect, useCallback } from "react";
import type { SiteData, FamilyMember } from "@/lib/data";

const newId = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2);

interface MemberWithId extends FamilyMember { _id: string; }

function withIds(items: FamilyMember[]): MemberWithId[] {
  return items.map(m => ({ ...m, _id: ((m as unknown) as Record<string, unknown>)._id as string || newId() }));
}

export default function FamilyManager() {
  const [members, setMembers] = useState<MemberWithId[]>([]);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [msg, setMsg] = useState("");
  const [modal, setModal] = useState<{ editing?: MemberWithId } | null>(null);
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/site-data");
      const json: SiteData = await res.json();
      setSiteData(json);
      setMembers(withIds(json.family || []));
    } catch { setMsg("加载失败"); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setName(""); setLabel(""); setDescription(""); setAvatar(""); setModal({}); };
  const openEdit = (m: MemberWithId) => { setName(m.name); setLabel(m.label); setDescription(m.description); setAvatar(m.avatar); setModal({ editing: m }); };

  const save = async () => {
    if (!siteData || saving || !name) return;
    setSaving(true);
    try {
      const currentMembers = [...members];
      const newMember: MemberWithId = { _id: modal?.editing?._id || newId(), name, label, description, avatar };
      if (modal?.editing) {
        const idx = currentMembers.findIndex(m => m._id === modal.editing!._id);
        if (idx >= 0) currentMembers[idx] = newMember;
        else currentMembers.push(newMember);
      } else {
        currentMembers.push(newMember);
      }
      const updated: SiteData = { ...siteData, family: currentMembers };
      const res = await fetch("/api/admin/site-data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
      if (res.ok) { setSiteData(updated); setMembers(currentMembers); setMsg("✅ 成员已保存！"); setModal(null); } else { setMsg("保存失败"); }
    } catch { setMsg("保存失败"); }
    setSaving(false);
  };

  const remove = async (m: MemberWithId) => {
    if (!siteData || !confirm(`确定删除 ${m.name}？`)) return;
    try {
      const filtered = members.filter(x => x._id !== m._id);
      const updated: SiteData = { ...siteData, family: filtered };
      const res = await fetch("/api/admin/site-data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
      if (res.ok) { setSiteData(updated); setMembers(filtered); setMsg(`已删除 ${m.name}`); } else { setMsg("删除失败"); }
    } catch { setMsg("删除失败"); }
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) { setAvatar(json.url); setMsg("头像已上传"); } else { setMsg("上传失败"); }
    } catch { setMsg("上传失败"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="diary-title text-xl">家庭管理</h2>
        <button onClick={openNew} className="rounded-full bg-accent-gold px-5 py-2 text-sm text-white hover:opacity-90">+ 新增成员</button>
      </div>
      {msg && <div className="rounded-lg border border-accent-gold/30 bg-accent-gold/5 px-4 py-2 text-sm text-accent-gold">{msg}</div>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {members.map(m => (
          <div key={m._id} className="flex items-center gap-4 rounded-lg border border-accent-gold/20 bg-bg-paper p-4">
            {m.avatar && <img src={m.avatar} alt="" className="size-14 rounded-full object-cover" />}
            <div className="flex-1"><h3 className="font-semibold text-text-primary">{m.name}</h3>{m.label && <p className="text-xs text-accent-gold">{m.label}</p>}</div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(m)} className="text-xs text-accent-gold">✏</button>
              <button onClick={() => remove(m)} className="text-xs text-accent-rose">🗑</button>
            </div>
          </div>
        ))}
        {members.length === 0 && <p className="text-text-muted caption-text col-span-2">暂无家庭成员</p>}
      </div>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-lg bg-bg-paper p-6" onClick={e => e.stopPropagation()}>
            <h3 className="diary-title text-lg mb-4">{modal.editing ? "编辑成员" : "新增成员"}</h3>
            <div className="space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder="姓名 *" />
              <input value={label} onChange={e => setLabel(e.target.value)} className="w-full rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder="标签" />
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder="介绍" />
              <div className="flex gap-2 items-center">
                <input value={avatar} onChange={e => setAvatar(e.target.value)} className="flex-1 rounded border border-accent-gold/20 px-3 py-2 text-sm" placeholder="头像 URL" />
                <label className="cursor-pointer rounded border border-accent-gold/30 px-3 py-2 text-xs text-accent-gold">上传<input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" /></label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="rounded-full border border-accent-gold/30 px-4 py-2 text-sm text-text-muted">取消</button>
              <button onClick={save} disabled={saving || !name} className={`rounded-full px-4 py-2 text-sm text-white ${saving || !name ? "bg-text-muted" : "bg-accent-gold hover:opacity-90"}`}>{saving ? "⏳ 保存中..." : "保存成员"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
