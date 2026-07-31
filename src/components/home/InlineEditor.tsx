"use client";

import { useState } from "react";

interface InlineEditorProps {
  title: string;
  fields: { label: string; key: string; type?: "text" | "textarea"; value: string }[];
  onSave: (data: Record<string, string>) => Promise<void>;
  position?: "top-right" | "inline";
  topOffset?: number;
}

export default function InlineEditor({ title, fields, onSave, position = "top-right", topOffset = 0 }: InlineEditorProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const openModal = () => {
    const init: Record<string, string> = {};
    fields.forEach(f => { init[f.key] = f.value; });
    setValues(init);
    setMsg("");
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await onSave(values);
      setMsg("✅ 已更新");
      setTimeout(() => setOpen(false), 1000);
    } catch {
      setMsg("保存失败");
    }
    setSaving(false);
  };

  return (
    <>
      <button onClick={openModal} style={position === "top-right" ? { top: 16 + topOffset } : undefined} className={position === "inline" ? "inline-flex items-center gap-1 rounded-full border border-accent-gold/30 px-3 py-1.5 text-xs text-accent-gold hover:bg-accent-gold/5" : "absolute right-6 z-10 rounded-full bg-bg-paper border border-accent-gold/30 px-3 py-1.5 text-xs text-accent-gold shadow-paper hover:bg-accent-gold/5"}>
        ✏ 编辑
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-lg bg-bg-paper p-6 shadow-paper-hover max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="diary-title text-lg mb-4">{title}</h3>
            <div className="space-y-4">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="block text-sm text-text-secondary mb-1">{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea
                      value={values[f.key] || ""}
                      onChange={e => setValues({ ...values, [f.key]: e.target.value })}
                      rows={4}
                      className="w-full rounded border border-accent-gold/20 px-3 py-2 text-sm"
                    />
                  ) : (
                    <input
                      type="text"
                      value={values[f.key] || ""}
                      onChange={e => setValues({ ...values, [f.key]: e.target.value })}
                      className="w-full rounded border border-accent-gold/20 px-3 py-2 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
            {msg && <p className="mt-4 text-sm text-center text-accent-gold">{msg}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setOpen(false)} className="rounded-full border border-accent-gold/30 px-4 py-2 text-sm text-text-muted">取消</button>
              <button onClick={save} disabled={saving} className={`rounded-full px-4 py-2 text-sm text-white ${saving ? "bg-text-muted" : "bg-accent-gold hover:opacity-90"}`}>
                {saving ? "⏳ 保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
