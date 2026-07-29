"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import { useState } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  className?: string;
}

export default function RichTextEditor({ content, onChange, className = "" }: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none outline-none min-h-[120px] px-4 py-3",
      },
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  const handleImageUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      const fd = new FormData();
      try {
        const fd = new FormData(); fd.append("file", file); const res = await fetch("/api/admin/upload", { method: "POST", body: fd }); const data = await res.json();
        if (data.url) {
          editor.chain().focus().setImage({ src: data.url }).run();
        }
      } catch { /* ignore */ }
      setUploading(false);
    };
    input.click();
  };

  return (
    <div className={`rounded-md border border-accent-gold/25 bg-bg-cream ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-accent-gold/15 px-2 py-2">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="B" title="粗体" />
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="I" title="斜体" />
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} label="H2" title="标题2" />
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} label="H3" title="标题3" />
        <span className="mx-1 text-text-muted">|</span>
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="•" title="无序列表" />
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="1." title="有序列表" />
        <span className="mx-1 text-text-muted">|</span>
        <button
          onClick={handleImageUpload}
          disabled={uploading}
          className="rounded px-2 py-1 text-xs text-text-muted hover:bg-accent-gold/10 hover:text-accent-gold disabled:opacity-50"
          title="插入图片"
        >
          {uploading ? "⏳" : "🖼"}
        </button>
      </div>
      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolBtn({ onClick, active, label, title }: { onClick: () => void; active: boolean; label: string; title: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
        active ? "bg-accent-gold/20 text-accent-gold" : "text-text-muted hover:bg-accent-gold/10 hover:text-accent-gold"
      }`}
      title={title}
      type="button"
    >
      {label}
    </button>
  );
}
