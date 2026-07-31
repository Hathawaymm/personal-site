"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import VisitorManager from "@/components/dashboard/VisitorManager";
import ResumeEditor from "@/components/dashboard/ResumeEditor";
import WorksManager from "@/components/dashboard/WorksManager";
import BlogManager from "@/components/dashboard/BlogManager";
import FamilyManager from "@/components/dashboard/FamilyManager";
import PhotosManager from "@/components/dashboard/PhotosManager";
import HomepageConfig from "@/components/dashboard/HomepageConfig";
import SystemSettings from "@/components/dashboard/SystemSettings";
import DashContent from "@/components/dashboard/DashContent";

const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  visitors: VisitorManager,
  resume: ResumeEditor,
  works: WorksManager,
  blog: BlogManager,
  family: FamilyManager,
  photos: PhotosManager,
  homepage: HomepageConfig,
  settings: SystemSettings,
  logs: DashContent,
};

function DashboardContent() {
  const { isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "visitors";

  if (!isAdmin) return null;

  const Component = TAB_COMPONENTS[tab];
  if (!Component) return <p className="text-text-muted caption-text">未知页面</p>;

  return (
    <div className="px-6 py-8">
      <Component />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="px-6 py-8 text-text-muted">加载中...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
