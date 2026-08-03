"use client";

import { useState, useEffect, useCallback } from "react";
import type { SiteData, ResumeData, ResumeItem, EducationItem } from "@/lib/data";
import { emptyResume } from "@/lib/constants";
import { proxyImageUrl } from "@/lib/image";
import { compressImage } from "@/lib/compress";

const emptyItemId = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2);

function addIds<T>(items: T[]): (T & { _id: string })[] {
  return items.map(item => {
    const rec = item as unknown as Record<string, unknown>;
    const id = rec._id as string | undefined;
    return { ...item, _id: id || emptyItemId() } as unknown as (T & { _id: string });
  });
}

export default function ResumeEditor() {
  const [data, setData] = useState<ResumeData>(emptyResume);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/site-data");
      const json: SiteData = await res.json();
      setSiteData(json);
      const resume = json.resume || emptyResume;
      setData({
        ...resume,
        experience: addIds(resume.experience) as unknown as ResumeItem[],
        education: addIds(resume.education) as unknown as EducationItem[],
      });
    } catch {
      setMsg("加载失败");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!siteData || saving) return;
    setSaving(true);
    try {
      const cleanExp = data.experience.map((item) => {
        const rec = { ...item } as unknown as Record<string, unknown>;
        delete rec._id;
        return rec as unknown as ResumeItem;
      });
      const cleanEdu = data.education.map((item) => {
        const rec = { ...item } as unknown as Record<string, unknown>;
        delete rec._id;
        return rec as unknown as EducationItem;
      });
      const updated: SiteData = { ...siteData, resume: { ...data, experience: cleanExp, education: cleanEdu } };
      const res = await fetch("/api/admin/site-data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
      if (res.ok) {
        setSiteData(updated);
        setMsg("✅ 简历已更新！");
      } else {
        setMsg("保存失败");
      }
    } catch {
      setMsg("保存失败");
    }
    setSaving(false);
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      const { blob, fileName } = await compressImage(file);
      fd.append("file", blob, fileName);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) {
        setData({ ...data, avatar: json.url });
        setMsg("✅ 照片已上传，请保存！");
      } else {
        setMsg("上传失败");
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "上传失败");
    }
    setUploading(false);
  };

  const addExperience = () => {
    const item = { _id: emptyItemId(), period: "", role: "", company: "", description: "" };
    setData({ ...data, experience: [...data.experience, item as unknown as ResumeItem] });
  };

  const updateExperience = (id: string, field: keyof ResumeItem, value: string) => {
    const exp = data.experience.map((item) => {
      const rec = item as unknown as Record<string, unknown>;
      return (rec._id === id ? { ...rec, [field]: value } : rec) as unknown as ResumeItem;
    });
    setData({ ...data, experience: exp });
  };

  const removeExperience = (id: string) => {
    if (!confirm("确定删除这段工作经历？删除后无法恢复哦。")) return;
    setData({ ...data, experience: data.experience.filter((item) => (item as unknown as Record<string, unknown>)._id !== id) });
  };

  const addEducation = () => {
    const item = { _id: emptyItemId(), period: "", school: "", degree: "" };
    setData({ ...data, education: [...data.education, item as unknown as EducationItem] });
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: string) => {
    const edu = data.education.map((item) => {
      const rec = item as unknown as Record<string, unknown>;
      return (rec._id === id ? { ...rec, [field]: value } : rec) as unknown as EducationItem;
    });
    setData({ ...data, education: edu });
  };

  const removeEducation = (id: string) => {
    if (!confirm("确定删除？")) return;
    setData({ ...data, education: data.education.filter((item) => (item as unknown as Record<string, unknown>)._id !== id) });
  };

  const updateSkills = (value: string) => {
    setData({ ...data, skills: value.split(",").map(s => s.trim()).filter(Boolean) });
  };

  return (
    <div className="space-y-8">
      <h2 className="diary-title text-xl">简历编辑</h2>
      {msg && <div className="rounded-lg border border-accent-gold/30 bg-gold-strong/5 px-4 py-2 text-sm text-gold-strong">{msg}</div>}

      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm text-text-secondary mb-1">姓名</label>
          <input type="text" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} className="w-full rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">简介</label>
          <textarea value={data.bio} onChange={e => setData({ ...data, bio: e.target.value })} rows={3} className="w-full rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">头像</label>
          <div className="flex items-center gap-4">
            {data.avatar && <img src={proxyImageUrl(data.avatar)} alt="" className="size-16 rounded-full object-cover" />}
            <label className="cursor-pointer rounded-full border border-accent-gold/30 px-4 py-2 text-sm text-gold-strong hover:bg-gold-strong/5">
              {uploading ? "上传中..." : "更换照片"}
              <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" disabled={uploading} />
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">技能（逗号分隔）</label>
          <input type="text" value={data.skills.join(", ")} onChange={e => updateSkills(e.target.value)} className="w-full rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm" placeholder="JavaScript, Python, React" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-3">工作经历</h3>
        {data.experience.map((exp) => {
          const id = (exp as unknown as Record<string, unknown>)._id as string;
          return (
            <div key={id} className="mb-4 rounded-lg border border-accent-gold/20 bg-bg-paper p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input value={exp.company} onChange={e => updateExperience(id, "company", e.target.value)} className="rounded border border-accent-gold/20 px-3 py-1.5 text-sm" placeholder="公司" />
                <input value={exp.role} onChange={e => updateExperience(id, "role", e.target.value)} className="rounded border border-accent-gold/20 px-3 py-1.5 text-sm" placeholder="职位" />
              </div>
              <input value={exp.period} onChange={e => updateExperience(id, "period", e.target.value)} className="w-full rounded border border-accent-gold/20 px-3 py-1.5 text-sm" placeholder="时间段" />
              <textarea value={exp.description} onChange={e => updateExperience(id, "description", e.target.value)} rows={2} className="w-full rounded border border-accent-gold/20 px-3 py-1.5 text-sm" placeholder="描述" />
              <button onClick={() => removeExperience(id)} className="text-xs text-rose-strong">✕ 删除</button>
            </div>
          );
        })}
        <button onClick={addExperience} className="rounded-full border border-accent-gold/30 px-4 py-2 text-sm text-gold-strong">+ 新增工作经历</button>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-3">教育背景</h3>
        {data.education.map((edu) => {
          const id = (edu as unknown as Record<string, unknown>)._id as string;
          return (
            <div key={id} className="mb-4 rounded-lg border border-accent-gold/20 bg-bg-paper p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input value={edu.school} onChange={e => updateEducation(id, "school", e.target.value)} className="rounded border border-accent-gold/20 px-3 py-1.5 text-sm" placeholder="学校" />
                <input value={edu.degree} onChange={e => updateEducation(id, "degree", e.target.value)} className="rounded border border-accent-gold/20 px-3 py-1.5 text-sm" placeholder="学位" />
              </div>
              <input value={edu.period} onChange={e => updateEducation(id, "period", e.target.value)} className="w-full rounded border border-accent-gold/20 px-3 py-1.5 text-sm" placeholder="时间段" />
              <button onClick={() => removeEducation(id)} className="text-xs text-rose-strong">✕ 删除</button>
            </div>
          );
        })}
        <button onClick={addEducation} className="rounded-full border border-accent-gold/30 px-4 py-2 text-sm text-gold-strong">+ 新增教育背景</button>
      </div>

      <button onClick={save} disabled={saving} className={`rounded-full px-6 py-2.5 text-sm font-medium text-white ${saving ? "bg-text-muted" : "bg-gold-strong hover:opacity-90"}`}>
        {saving ? "⏳ 保存中..." : "保存简历"}
      </button>
    </div>
  );
}
