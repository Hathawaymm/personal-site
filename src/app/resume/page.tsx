"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import ResumeSection from "@/components/resume/ResumeSection";
import { useEffect, useState } from "react";
import type { ResumeData } from "@/lib/data";
import { emptyResume } from "@/lib/constants";
import { useAccessLog } from "@/hooks/useAccessLog";

export default function ResumePage() {
  useAccessLog("简历");
  const [resume, setResume] = useState<ResumeData>(emptyResume);

  useEffect(() => {
    fetch("/api/site-data")
      .then(r => r.json())
      .then(d => setResume(d.resume || emptyResume))
      .catch((err) => { console.error("加载简历失败:", err); });
  }, []);

  return (
    <AuthGuard requirePermissions={["resume_text"]}>
      <div className="min-h-screen pt-24 pb-16">
        <ResumeSection data={resume} />
      </div>
    </AuthGuard>
  );
}
