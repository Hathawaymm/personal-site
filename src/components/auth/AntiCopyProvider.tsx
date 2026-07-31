"use client";

import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface AntiCopyProviderProps {
  children: ReactNode;
}

export default function AntiCopyProvider({ children }: AntiCopyProviderProps) {
  const { isAdmin, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (isAdmin) {
      // 管理员：完全放行，移除限制
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      return;
    }

    // 访客：禁止复制/下载
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    const blockContext = (e: Event) => {
      if (!(e.target instanceof Element)) return;
      if (e.target.closest("input, textarea, .ProseMirror, [contenteditable]")) return;
      e.preventDefault();
    };
    const blockDrag = (e: Event) => {
      if (!(e.target instanceof Element)) return;
      if (e.target.closest("input, textarea, .ProseMirror, [contenteditable]")) return;
      e.preventDefault();
    };
    const blockCopy = (e: ClipboardEvent) => {
      if (!(e.target instanceof Element)) return;
      if (e.target.closest("input, textarea, .ProseMirror, [contenteditable]")) return;
      e.preventDefault();
    };
    const blockKey = (e: KeyboardEvent) => {
      if (!(e.target instanceof Element)) return;
      if (e.target.closest("input, textarea, .ProseMirror, [contenteditable]")) return;
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "p" || e.key === "s")) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("dragstart", blockDrag);
    document.addEventListener("copy", blockCopy);
    document.addEventListener("cut", blockCopy);
    document.addEventListener("keydown", blockKey);

    return () => {
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("dragstart", blockDrag);
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("cut", blockCopy);
      document.removeEventListener("keydown", blockKey);
    };
  }, [isAdmin, loading]);

  return <>{children}</>;
}
