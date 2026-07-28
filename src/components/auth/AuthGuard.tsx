"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import type { Permissions } from "@/lib/permissions";

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requirePermissions?: (keyof Permissions)[];
}

export default function AuthGuard({ children, requireAdmin, requirePermissions }: AuthGuardProps) {
  const { loading, isLoggedIn, isAdmin, status, permissions, nickname } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [loading, isLoggedIn, router]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-bg-cream"><p className="text-text-muted">加载中...</p></div>;
  }

  if (!isLoggedIn) return null;

  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-cream">
        <div className="text-center px-4">
          <h1 className="diary-title text-2xl">🚪 哎呀，这里是{ nickname || "管理员" }的私人小书房</h1>
          <p className="mt-4 text-text-muted caption-text">没经过允许不能入内哦。我这就送你回客厅~</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && status === "rejected") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-cream">
        <div className="text-center px-4">
          <h1 className="diary-title text-2xl">很遗憾</h1>
          <p className="mt-4 text-text-muted caption-text">你的访问申请未被通过。如有疑问，可联系管理员。</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && status === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-cream">
        <div className="text-center px-4 max-w-md">
          <h1 className="diary-title text-2xl">⏳ 等待审批</h1>
          <p className="mt-4 text-text-muted caption-text">
            嘿，收到你的申请啦！我已经把你的来访消息悄悄递给{ nickname || "管理员" }了。
            等管理员小手一点"通过"，你就能看到这里的内容啦，请稍等片刻哦~
          </p>
        </div>
      </div>
    );
  }

  if (requirePermissions && !isAdmin) {
    const hasAll = requirePermissions.every(p => permissions[p] === true);
    if (!hasAll) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-bg-cream">
          <div className="text-center px-4">
            <h1 className="diary-title text-2xl">🔒 哎呀，这个房间暂时上锁啦</h1>
            <p className="mt-4 text-text-muted caption-text">{ nickname || "管理员" }还没给你钥匙哦~</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
