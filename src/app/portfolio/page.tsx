import type { Metadata } from "next";
import { CareerProvider } from "@/components/portfolio/career-context";
import DarkPortfolio from "@/components/portfolio/dark/DarkPortfolio";
import { getCareerDocument } from "@/lib/career-content";
import { readRequestLang } from "@/lib/request-lang";

export const metadata: Metadata = {
  title: "张寒梅 · 3D 作品集 | Hanmei Zhang",
  description: "软件项目经理张寒梅的公开作品集：3D 技能键盘、十六个案例与流程治理。无需登录。",
  robots: { index: true, follow: true },
};

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ draft?: string }> }) {
  const params = await searchParams;
  const [document, initialLang] = await Promise.all([getCareerDocument(params.draft === "1"), readRequestLang()]);
  return (
    <CareerProvider document={document}>
      <DarkPortfolio initialLang={initialLang} />
    </CareerProvider>
  );
}
