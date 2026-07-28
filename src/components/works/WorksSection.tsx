import type { WorkItem } from "@/lib/data";

interface WorksSectionProps {
  works: WorkItem[];
}

export default function WorksSection({ works }: WorksSectionProps) {
  if (works.length === 0) return null;

  return (
    <section id="works" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="text-center">
          <h2 className="diary-title text-2xl sm:text-3xl">视频创作</h2>
          <p className="caption-text mt-2 text-sm">一些用镜头讲述的故事</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {works.filter(w => w.videoUrl || w.cover).map((work) => (
            <div
              key={work.title}
              className="overflow-hidden rounded-lg border border-accent-gold/20 bg-bg-cream/85 shadow-paper backdrop-blur transition-all duration-300 hover:shadow-paper-hover"
            >
              {work.videoUrl ? (
                <div className="relative aspect-video w-full bg-bg-warm">
                  <video
                    className="h-full w-full object-cover"
                    src={work.videoUrl}
                    poster={work.cover}
                    controls
                    preload="metadata"
                  >
                    您的浏览器不支持视频播放。
                  </video>
                </div>
              ) : (
                <div className="relative aspect-video w-full bg-bg-warm">
                  {work.cover && <img src={work.cover} alt="" className="h-full w-full object-cover" />}
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  {work.category && <span className="rounded-full border border-accent-gold/30 px-2 py-0.5 text-xs text-accent-gold">{work.category}</span>}
                  <h3 className="diary-title text-lg">{work.title}</h3>
                </div>
                {work.description && <p className="text-sm leading-relaxed text-text-muted">{work.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
