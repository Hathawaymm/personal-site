import { NextResponse } from "next/server";
import { invokeCloudFunction } from "@/lib/cloudbase";
import { DEFAULT_HOMEPAGE, HOME_MODULE_LABELS, type HomepageConfig, type HomeModuleItem } from "@/lib/data";

function normalizeModuleOrder(raw: unknown): HomeModuleItem[] {
  if (!Array.isArray(raw)) return DEFAULT_HOMEPAGE.moduleOrder;
  return raw.map((item) => {
    if (typeof item === "string") {
      const key = (HOME_MODULE_LABELS as Record<string, string>)[item] ? item as HomeModuleItem["key"] : "works";
      return { key, label: HOME_MODULE_LABELS[key] };
    }
    if (item && typeof item === "object") {
      const obj = item as { key?: string; label?: string };
      const key = obj.key && (HOME_MODULE_LABELS as Record<string, string>)[obj.key] ? obj.key as HomeModuleItem["key"] : "works";
      return { key, label: obj.label || HOME_MODULE_LABELS[key] };
    }
    return { key: "works", label: HOME_MODULE_LABELS.works };
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key") || "homepage";
  try {
    const result = await invokeCloudFunction("site-data", { action: "getConfig", configKey: key });
    if (result.code === 0 && result.data) {
      if (key === "homepage") {
        const merged = { ...DEFAULT_HOMEPAGE, ...(result.data as Partial<HomepageConfig>) };
        merged.moduleOrder = normalizeModuleOrder(merged.moduleOrder);
        return NextResponse.json(merged);
      }
      return NextResponse.json(result.data);
    }
    return NextResponse.json(key === "homepage" ? DEFAULT_HOMEPAGE : {});
  } catch {
    return NextResponse.json(key === "homepage" ? DEFAULT_HOMEPAGE : {});
  }
}
