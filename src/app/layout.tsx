import { AuthProvider } from "@/contexts/AuthContext";
import BgPhotoWall from "@/components/photo/BgPhotoWall";
import AntiCopyProvider from "@/components/auth/AntiCopyProvider";
import Watermark from "@/components/auth/Watermark";
import { ToastProvider } from "@/components/ui/Toast";
import { PreviewProvider } from "@/components/dashboard/PreviewToggle";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VisitorBanner, { AdminWelcomeToast, ApprovedToast } from "@/components/auth/VisitorBanner";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "欢迎来到我的空间，我的朋友",
  description: "用镜头记录每一个温暖日常",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="relative flex min-h-full flex-col text-text-primary antialiased">
        <AuthProvider>
          <AntiCopyProvider>
            <PreviewProvider>
              <ToastProvider>
                <Watermark />
                <BgPhotoWall />
                <div className="relative z-10 flex min-h-full flex-col">
                  <Navbar />
                  <VisitorBanner />
                  <AdminWelcomeToast />
                  <ApprovedToast />
                  <main className="relative flex-1">{children}</main>
                  <Footer />
                </div>
              </ToastProvider>
            </PreviewProvider>
          </AntiCopyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
