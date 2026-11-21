"use client";

import type { Copy } from "@/data/portfolio-data";

export function Pair({ label, value, onChange, rows = 3 }: { label: string; value: Copy; onChange: (next: Copy) => void; rows?: number }) {
  return (
    <fieldset className="grid gap-2 sm:grid-cols-2">
      <legend className="col-span-full text-xs text-text-muted">{label}</legend>
      <textarea rows={rows} value={value.zh} onChange={(event) => onChange({ ...value, zh: event.target.value })} className="rounded-lg border border-accent-gold/30 bg-bg-paper p-2 text-sm" aria-label={`${label} 中文`} />
      <textarea rows={rows} value={value.en} onChange={(event) => onChange({ ...value, en: event.target.value })} className="rounded-lg border border-accent-gold/30 bg-bg-paper p-2 text-sm" aria-label={`${label} English`} />
    </fieldset>
  );
}

export function Line({ label, value, onChange }: { label: string; value: string; onChange: (next: string) => void }) {
  return (
    <label className="block text-xs text-text-muted">{label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-accent-gold/30 bg-bg-paper p-2 text-sm" />
    </label>
  );
}

export function CopyList({ label, items, onChange, rows = 3 }: { label: string; items: Copy[]; onChange: (next: Copy[]) => void; rows?: number }) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <Pair
          key={`${label}-${index}`}
          label={`${label} ${index + 1}`}
          value={item}
          rows={rows}
          onChange={(next) => onChange(items.map((current, itemIndex) => itemIndex === index ? next : current))}
        />
      ))}
    </div>
  );
}
