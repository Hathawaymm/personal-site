const CDN_HOST = "tcb.qcloud.la";

export function proxyImageUrl(src: string): string {
  if (!src) return src;
  if (src.includes(CDN_HOST)) {
    return `/api/image?url=${encodeURIComponent(src)}`;
  }
  return src;
}
