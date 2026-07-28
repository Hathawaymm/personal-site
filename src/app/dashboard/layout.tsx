"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, Suspense, createContext, useContext, type ReactNode } from "react";

const MENU_ITEMS = [
  { key: "visitors", label: "访客管理", href: "/dashboard?tab=visitors" },
  { key: "resume", label: "简历编辑", href: "/dashboard?tab=resume" },
  { key: "works", label: "作品管理", href: "/dashboard?tab=works" },
  { key: "blog", label: "博客管理", href: "/dashboard?tab=blog" },
  { key: "family", label: "家庭编辑", href: "/dashboard?tab=family" },
  { key: "photos", label: "照片墙管理", href: "/dashboard?tab=photos" },
  { key: "settings", label: "系统设置", href: "/dashboard?tab=settings" },
  { key: "logs", label: "日志中心", href: "/dashboard?tab=logs" },
] as const;

const SidebarContext = createContext({ collapsed: false, setCollapsed: (_: boolean) => {} });
const useSidebar = () => useContext(SidebarContext);

function Sidebar() {
  const searchParams = useSearchParams();
  const { isAdmin, logout } = useAuth();
  const { collapsed, setCollapsed } = useSidebar();
  const currentTab = searchParams.get("tab") || "visitors";

  if (!isAdmin) return null;

  return (
    <aside className={`fixed top-16 left-0 bottom-0 z-30 border-r border-accent-gold/15 bg-bg-paper transition-all ${collapsed ? "w-16" : "w-56"}`}>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-accent-gold/10">
          {!collapsed && <span className="diary-title text-sm">后台管理</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="text-text-muted hover:text-text-primary text-sm">
            {collapsed ? "☰" : "✕"}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {MENU_ITEMS.map(item => (
            <Link key={item.key} href={item.href} className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${currentTab === item.key ? "bg-accent-gold/10 text-accent-gold border-r-2 border-accent-gold" : "text-text-secondary hover:bg-bg-warm hover:text-text-primary"}`}>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-accent-gold/10 p-4">
          <Link href="/" className="text-xs text-text-muted hover:text-text-primary block mb-2">← 返回首页</Link>
          <button onClick={logout} className="text-xs text-accent-rose hover:opacity-80">退出登录</button>
        </div>
      </div>
    </aside>
  );
}

function DashboardShell({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex min-h-screen pt-16">
      <main className={`flex-1 transition-all ${collapsed ? "ml-16" : "ml-56"}`}>
        {children}
      </main>
    </div>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>
      <DashboardShell>{children}</DashboardShell>
    </SidebarContext.Provider>
  );
}
