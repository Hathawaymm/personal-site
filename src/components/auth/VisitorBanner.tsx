"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export default function VisitorBanner() {
  const { isLoggedIn, isAdmin, status } = useAuth();

  if (!isLoggedIn || isAdmin) return null;

  if (status === "pending") {
    return (
      <div className="sticky top-16 z-40 bg-amber-50 border-b border-amber-200">
        <div className="mx-auto max-w-5xl px-4 py-3 text-center text-sm text-amber-800">
          🙋‍♂️ 嘿，收到你的申请啦！我已经把你的来访消息悄悄递给管理员了。等管理员小手一点"通过"，你就能看到管理员的小窝全貌啦，请稍等片刻哦~
        </div>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="sticky top-16 z-40 bg-red-50 border-b border-red-200">
        <div className="mx-auto max-w-5xl px-4 py-3 text-center text-sm text-red-700">
          很遗憾，你的访问申请未被通过。如有疑问，可联系管理员。
        </div>
      </div>
    );
  }

  return null;
}

export function AdminWelcomeToast() {
  const { isAdmin, nickname } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setShow(true);
      const t = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(t);
    }
  }, [isAdmin]);

  if (!show) return null;

  return (
    <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-right">
      <div className="rounded-lg border border-accent-gold/30 bg-bg-paper px-5 py-3 shadow-paper">
        <p className="text-sm text-text-primary">
          🎉 欢迎回家！{nickname}，所有功能都已为你准备好。
        </p>
      </div>
    </div>
  );
}

export function ApprovedToast() {
  const { isAdmin, isLoggedIn, status, nickname } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isAdmin && isLoggedIn && status === "approved") {
      setShow(true);
      const t = setTimeout(() => setShow(false), 4000);
      return () => clearTimeout(t);
    }
  }, [isAdmin, isLoggedIn, status]);

  if (!show) return null;

  return (
    <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-right">
      <div className="rounded-lg border border-accent-gold/30 bg-bg-paper px-5 py-3 shadow-paper">
        <p className="text-sm text-text-primary">
          👋 欢迎回来，{nickname}！
        </p>
      </div>
    </div>
  );
}
