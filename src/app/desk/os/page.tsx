import { CareerProvider } from "@/components/portfolio/career-context";
import { getCareerDocument } from "@/lib/career-content";
import { readRequestLang } from "@/lib/request-lang";
import DeskOsClient from "./view";

export default async function DeskOsPage({ searchParams }: { searchParams: Promise<{ draft?: string }> }) {
  const params = await searchParams;
  const [document, initialLang] = await Promise.all([getCareerDocument(params.draft === "1"), readRequestLang()]);
  return (
    <CareerProvider document={document}>
      <DeskOsClient initialLang={initialLang} />
    </CareerProvider>
  );
}
