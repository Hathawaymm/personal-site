import type { Metadata } from "next";
import CareerPage from "@/components/portfolio/CareerPage";

export const metadata: Metadata = {
  title: "张寒梅 · 简历 | Hanmei Zhang",
  description: "张寒梅的公开中英文简历，可用浏览器直接打印或导出 PDF。无需登录。",
  robots: { index: true, follow: true },
};

export default function ResumePage() {
  return <CareerPage mode="resume" />;
}
