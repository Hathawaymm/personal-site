import { unstable_cache } from "next/cache";
import { revalidatePath, revalidateTag } from "next/cache";
import { seedCareerDocument, type CareerDocument } from "@/data/career-document";
import { latestCareer, saveCareerRevision, type RevisionKind } from "@/lib/career-store";
import { requireAdminCookie } from "@/lib/require-admin";

const TAG = "career-content";

const readPublished = unstable_cache(async () => latestCareer("published"), ["career-published"], { tags: [TAG] });

export async function getCareerDocument(draft = false): Promise<CareerDocument> {
  try {
    if (draft && await requireAdminCookie()) {
      return await latestCareer("draft") ?? await latestCareer("published") ?? seedCareerDocument();
    }
    if (process.env.NODE_ENV !== "production") {
      return await latestCareer("published") ?? seedCareerDocument();
    }
    return await readPublished() ?? seedCareerDocument();
  } catch (error) {
    console.error("读取作品集内容失败，使用内置文案", error);
    return seedCareerDocument();
  }
}

export async function persistCareer(kind: RevisionKind, input: unknown) {
  const saved = await saveCareerRevision(kind, input);
  if (kind === "published") {
    revalidateTag(TAG, "max");
    revalidatePath("/portfolio");
    revalidatePath("/desk");
    revalidatePath("/desk/os");
    revalidatePath("/resume");
  }
  return saved;
}
