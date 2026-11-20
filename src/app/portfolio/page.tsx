import type { Metadata } from "next";
import CareerPage from "@/components/portfolio/CareerPage";

export const metadata: Metadata = {
  title: "张寒梅 · 项目作品集 | Hanmei Zhang",
  description: "软件项目经理张寒梅的公开中英文作品集：订单履约、CRM、AI 与金融科技案例，以及流程治理。无需登录。",
  robots: { index: true, follow: true },
};

export default function PortfolioPage() {
  return <CareerPage mode="portfolio" />;
}
