import type { Metadata } from "next";
import "./globals.css";
import BgPhotoWall from "@/components/photo/BgPhotoWall";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "欢迎来到我的空间，我的朋友",
  description: "用镜头记录每一个温暖日常",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="relative flex min-h-full flex-col text-text-primary antialiased">
        <BgPhotoWall />
        <div className="relative z-10 flex min-h-full flex-col">
          <Navbar />
          <main className="relative flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
