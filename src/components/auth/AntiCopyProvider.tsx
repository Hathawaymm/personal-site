"use client";

import { useEffect, type ReactNode } from "react";

interface AntiCopyProviderProps {
  children: ReactNode;
}

export default function AntiCopyProvider({ children }: AntiCopyProviderProps) {
  useEffect(() => {
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
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "s")) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("dragstart", blockDrag);
    document.addEventListener("copy", blockCopy);
    document.addEventListener("cut", blockCopy);
    document.addEventListener("keydown", blockKey);

    return () => {
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("dragstart", blockDrag);
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("cut", blockCopy);
      document.removeEventListener("keydown", blockKey);
    };
  }, []);

  return <>{children}</>;
}
