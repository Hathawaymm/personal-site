"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";

export default function ProfilePage() {
  const { nickname, githubUser } = useAuth();
  const [newNickname, setNewNickname] = useState(nickname);
  const [avatar, setAvatar] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: newNickname, avatar }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("✅ 昵称已更新~");
        setTimeout(() => setMsg(""), 4000);
      } else {
        setMsg("保存失败: " + (data.error || ""));
      }
    } catch {
      setMsg("保存失败");
    }
    setSaving(false);
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (json.url) setAvatar(json.url);
    else setMsg("上传失败");
  };

  return (
    <AuthGuard requireAdmin>
      <div className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-md px-4">
          <h1 className="diary-title text-2xl mb-8 text-center">个人设置</h1>

          {msg && (
            <div className="mb-4 rounded-lg border border-accent-gold/30 bg-accent-gold/5 px-4 py-2 text-sm text-accent-gold text-center">
              {msg}
            </div>
          )}

          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="size-24 rounded-full bg-bg-warm overflow-hidden border-2 border-accent-gold/30">
                {avatar && <img src={avatar} alt="" className="w-full h-full object-cover" />}
              </div>
              <label className="cursor-pointer text-sm text-accent-gold hover:underline">
                更换头像
                <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
              </label>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1">昵称</label>
              <input
                type="text"
                value={newNickname}
                onChange={e => setNewNickname(e.target.value)}
                className="w-full rounded-lg border border-accent-gold/30 bg-bg-paper px-4 py-2 text-sm"
                placeholder={githubUser?.login || "你的昵称"}
              />
              <p className="mt-1 text-xs text-text-muted">GitHub 用户名: {githubUser?.login}</p>
            </div>

            <button
              onClick={save}
              disabled={saving}
              className={`w-full rounded-full px-6 py-2.5 text-sm font-medium text-white ${saving ? "bg-text-muted" : "bg-accent-gold hover:opacity-90"}`}
            >
              {saving ? "⏳ 保存中..." : "保存设置"}
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
