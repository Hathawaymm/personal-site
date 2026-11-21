"use client";

import { useRef, useState } from "react";

const MAX_BYTES = 4 * 1024 * 1024;

export default function ImageField({
  label,
  hint,
  value,
  fallback,
  testId,
  onChange,
}: {
  label: string;
  hint: string;
  /** Saved URL. Empty means the built-in image. */
  value: string;
  fallback: string;
  testId: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const preview = value || fallback;
  const custom = Boolean(value);

  const send = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("请上传图片文件");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("图片不能超过 4MB");
      return;
    }
    setBusy(true);
    setError("");
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/admin/career/upload", { method: "POST", body });
    const payload = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok || typeof payload.url !== "string") {
      setError(typeof payload.error === "string" ? payload.error : "上传失败");
      return;
    }
    onChange(payload.url);
  };

  return (
    <section data-testid={testId} className={`rounded-2xl border bg-bg-paper p-3 ${over ? "border-accent-gold" : "border-accent-gold/30"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{label}</h3>
          <p className="mt-1 text-xs text-text-muted">{hint}{custom ? "当前是上传的图片。" : "当前是默认图片。"}</p>
        </div>
        <img src={preview} alt="" className="h-24 w-36 rounded-lg border border-accent-gold/20 object-cover" />
      </div>
      <div
        data-testid={`${testId}-drop`}
        className="mt-3 rounded-xl border border-dashed border-accent-gold/40 bg-bg-warm px-3 py-4 text-center text-sm text-text-secondary"
        onDragOver={(event) => { event.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          const file = event.dataTransfer.files?.[0];
          if (file) void send(file);
        }}
      >
        {busy ? "正在转成 WebP 并上传…" : "把图片拖到这里，或使用下面的按钮。最大 4MB，会自动转成 WebP。"}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="rounded-full bg-gold-strong px-3 py-1.5 text-sm text-white">
          {custom ? "更换" : "上传"}
        </button>
        <button type="button" disabled={busy || !custom} onClick={() => { setError(""); onChange(""); }} className="rounded-full border border-accent-gold/40 px-3 py-1.5 text-sm disabled:opacity-40">
          恢复默认
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        aria-label={`${label} 文件`}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void send(file);
        }}
      />
      {error && <p className="mt-2 text-sm text-accent-rose">{error}</p>}
    </section>
  );
}
