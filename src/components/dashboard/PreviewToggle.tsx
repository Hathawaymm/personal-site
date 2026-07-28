"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface PreviewContextValue {
  previewing: boolean;
  setPreviewing: (v: boolean) => void;
}

const PreviewContext = createContext<PreviewContextValue>({ previewing: false, setPreviewing: () => {} });

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [previewing, setPreviewing] = useState(false);
  return (
    <PreviewContext.Provider value={{ previewing, setPreviewing }}>
      {children}
    </PreviewContext.Provider>
  );
}

export function usePreview() {
  return useContext(PreviewContext);
}

export function PreviewToggle() {
  const { isAdmin } = useAuth();
  const { previewing, setPreviewing } = usePreview();

  if (!isAdmin) return null;

  return (
    <>
      <button
        onClick={() => setPreviewing(!previewing)}
        className={`fixed top-20 right-24 z-50 rounded-full border px-4 py-2 text-sm shadow-paper transition-all ${
          previewing
            ? "border-accent-sky/60 bg-accent-sky/90 text-white"
            : "border-accent-gold/30 bg-bg-paper text-accent-gold hover:bg-accent-gold/5"
        }`}
      >
        {previewing ? "退出预览" : "👁 预览访客视图"}
      </button>

      {previewing && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-accent-sky/10 border-b border-accent-sky/30">
          <div className="mx-auto max-w-5xl px-4 py-2 text-center text-sm text-accent-sky">
            👁 当前为访客预览模式——你正以"拥有全部权限的访客"身份浏览首页。点击右上角【退出预览】可返回管理员视图。
          </div>
        </div>
      )}
    </>
  );
}
