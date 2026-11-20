import type { Metadata } from "next";
import CareerPage from "@/components/portfolio/CareerPage";
import { CareerProvider } from "@/components/portfolio/career-context";
import { getCareerDocument } from "@/lib/career-content";
import { readRequestLang } from "@/lib/request-lang";

export const metadata: Metadata = {
  title: "张寒梅 · 简历 | Hanmei Zhang",
  description: "张寒梅的公开中英文简历，可用浏览器直接打印或导出 PDF。无需登录。",
  robots: { index: true, follow: true },
};

export default async function ResumePage({ searchParams }: { searchParams: Promise<{ draft?: string }> }) {
  const params = await searchParams;
  const [document, initialLang] = await Promise.all([getCareerDocument(params.draft === "1"), readRequestLang()]);
  return (
    <CareerProvider document={document}>
      <CareerPage initialLang={initialLang} />
    </CareerProvider>
  );
}
