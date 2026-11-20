"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import BgPhotoWall from "@/components/photo/BgPhotoWall";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VisitorBanner, { AdminWelcomeToast, ApprovedToast } from "@/components/auth/VisitorBanner";

function isCareerPath(pathname: string): boolean {
  return pathname === "/portfolio" || pathname === "/resume" || pathname.startsWith("/portfolio/") || pathname.startsWith("/resume/");
}

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isCareerPath(pathname)) {
    return <div className="relative z-10 flex min-h-full flex-col">{children}</div>;
  }

  return (
    <div className="relative min-h-full">
      <BgPhotoWall />
      <div className="relative z-10 flex min-h-full flex-col">
        <Navbar />
        <VisitorBanner />
        <AdminWelcomeToast />
        <ApprovedToast />
        <main className="relative flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

export { isCareerPath };
