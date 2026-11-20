import { cookies } from "next/headers";
import { LANG_STORAGE_KEY, readStoredLang } from "@/lib/route-policy";
import type { Lang } from "@/data/portfolio-data";

/** Cookie wins for SSR. No cookie means English, ignoring Accept-Language. */
export async function readRequestLang(): Promise<Lang> {
  const jar = await cookies();
  return readStoredLang(jar.get(LANG_STORAGE_KEY)?.value);
}
