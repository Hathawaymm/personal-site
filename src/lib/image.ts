const CDN_HOST = "tcb.qcloud.la";

export function proxyImageUrl(src: string): string {
  if (!src) return src;
  if (src.includes(CDN_HOST)) {
    return `/api/image?url=${encodeURIComponent(src)}`;
  }
  return src;
}

export function proxyHtmlImages(html: string): string {
  if (!html || !html.includes(CDN_HOST)) return html;
  return html.replace(/src="([^"]*tcb\.qcloud\.la[^"]*)"/g, (match, url: string) => {
    return `src="${proxyImageUrl(url)}"`;
  });
}
