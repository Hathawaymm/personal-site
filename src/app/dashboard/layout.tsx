"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, Suspense, createContext, useContext, type ReactNode } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const MENU_ITEMS = [
  { key: "homepage", label: "首页配置", href: "/dashboard?tab=homepage" },
  { key: "works", label: "作品管理", href: "/dashboard?tab=works" },
  { key: "photos", label: "照片墙管理", href: "/dashboard?tab=photos" },
  { key: "visitors", label: "访客管理", href: "/dashboard?tab=visitors" },
  { key: "logs", label: "日志中心", href: "/dashboard?tab=logs" },
  { key: "settings", label: "系统设置", href: "/dashboard?tab=settings" },
  { key: "resume", label: "简历编辑", href: "/dashboard?tab=resume" },
  { key: "blog", label: "博客管理", href: "/dashboard?tab=blog" },
  { key: "family", label: "家庭编辑", href: "/dashboard?tab=family" },
] as const;

const DEFAULT_ORDER = MENU_ITEMS.map(m => m.key);

const SidebarContext = createContext({ collapsed: false, setCollapsed: (_: boolean) => {} });
const useSidebar = () => useContext(SidebarContext);

function MenuItem({ item, currentTab, collapsed }: { item: typeof MENU_ITEMS[number]; currentTab: string; collapsed: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.key });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={isDragging ? "opacity-50" : ""}>
      <Link
        href={item.href}
        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${currentTab === item.key ? "bg-gold-strong/10 text-gold-strong border-l-2 border-accent-gold" : "text-text-secondary hover:bg-bg-warm hover:text-text-primary"}`}
      >
        <span {...attributes} {...listeners} className="cursor-grab select-none text-text-muted">☰</span>
        {!collapsed && <span>{item.label}</span>}
      </Link>
    </div>
  );
}

function Sidebar() {
  const searchParams = useSearchParams();
  const { isAdmin, logout } = useAuth();
  const { collapsed, setCollapsed } = useSidebar();
  const currentTab = searchParams.get("tab") || "visitors";
  const [order, setOrder] = useState<string[]>([...DEFAULT_ORDER]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    fetch("/api/config?key=sidebar")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d?.order) && d.order.length > 0) {
          const valid = d.order.filter((k: string) => MENU_ITEMS.some(m => m.key === k));
          const missing = DEFAULT_ORDER.filter(k => !valid.includes(k));
          setOrder([...valid, ...missing]);
        }
      })
      .catch(() => {});
  }, []);

  const saveOrder = (next: string[]) => {
    setOrder(next);
    fetch("/api/admin/config?key=sidebar", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: next }) }).catch(() => {});
  };

  const onDragEnd = (event: DragEndEvent) => {
    if (!event.over || event.active.id === event.over.id) return;
    const oldIndex = order.indexOf(String(event.active.id));
    const newIndex = order.indexOf(String(event.over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    saveOrder(arrayMove(order, oldIndex, newIndex));
  };

  if (!isAdmin) return null;

  const sortedItems = order.map(k => MENU_ITEMS.find(m => m.key === k)!).filter(Boolean);

  return (
    <aside className={`fixed top-16 right-0 bottom-0 z-30 border-l border-accent-gold/15 bg-bg-paper transition-all ${collapsed ? "w-16" : "w-56"}`}>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-accent-gold/10">
          {!collapsed && <span className="diary-title text-sm">后台管理</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="text-text-muted hover:text-text-primary text-sm">
            {collapsed ? "☰" : "✕"}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={sortedItems.map(i => i.key)} strategy={verticalListSortingStrategy}>
              {sortedItems.map(item => <MenuItem key={item.key} item={item} currentTab={currentTab} collapsed={collapsed} />)}
            </SortableContext>
          </DndContext>
        </nav>
        <div className="border-t border-accent-gold/10 p-4">
          <Link href="/" className="text-xs text-text-muted hover:text-text-primary block mb-2">← 返回首页</Link>
          <button onClick={logout} className="text-xs text-rose-strong hover:opacity-80">退出登录</button>
        </div>
      </div>
    </aside>
  );
}

function DashboardShell({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex min-h-screen pt-16">
      <main className={`flex-1 transition-all ${collapsed ? "mr-16" : "mr-56"}`}>
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
