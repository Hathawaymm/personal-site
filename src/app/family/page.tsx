"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import FamilySection from "@/components/family/FamilySection";
import { useEffect, useState } from "react";
import type { FamilyMember } from "@/lib/data";
import { useAccessLog } from "@/hooks/useAccessLog";

export default function FamilyPage() {
  useAccessLog("家庭");
  const [members, setMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    fetch("/api/site-data")
      .then(r => r.json())
      .then(d => setMembers(d.family || []))
      .catch((err) => { console.error("加载家庭成员失败:", err); });
  }, []);

  return (
    <AuthGuard requirePermissions={["family"]}>
      <div className="min-h-screen pt-6 pb-16">
        <FamilySection members={members} />
      </div>
    </AuthGuard>
  );
}
