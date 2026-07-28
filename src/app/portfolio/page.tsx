"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import WorksSection from "@/components/works/WorksSection";
import { useEffect, useState } from "react";
import type { WorkItem } from "@/lib/data";
import { useAccessLog } from "@/hooks/useAccessLog";

export default function PortfolioPage() {
  useAccessLog("作品集");
  const [works, setWorks] = useState<WorkItem[]>([]);

  useEffect(() => {
    fetch("/api/site-data")
      .then(r => r.json())
      .then(d => setWorks(d.works || []))
      .catch((err) => { console.error("加载作品失败:", err); });
  }, []);

  return (
    <AuthGuard requirePermissions={["portfolio"]}>
      <div className="min-h-screen pt-6 pb-16">
        <WorksSection works={works} />
      </div>
    </AuthGuard>
  );
}
