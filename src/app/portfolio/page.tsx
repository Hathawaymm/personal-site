import type { Metadata } from "next";
import DarkPortfolio from "@/components/portfolio/dark/DarkPortfolio";

export const metadata: Metadata = {
  title: "张寒梅 · 3D 作品集 | Hanmei Zhang",
  description: "软件项目经理张寒梅的公开作品集：3D 技能键盘、十六个案例与流程治理。无需登录。",
  robots: { index: true, follow: true },
};

export default function PortfolioPage() {
  return <DarkPortfolio />;
}
