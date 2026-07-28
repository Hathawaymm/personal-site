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

    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("dragstart", blockDrag);

    return () => {
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("dragstart", blockDrag);
    };
  }, []);

  return <>{children}</>;
}
