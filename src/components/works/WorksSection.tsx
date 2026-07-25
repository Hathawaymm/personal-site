const WORKS = [
  {
    title: "水猴子 — 第一集",
    description: "童年关于「水猴子」的恐怖传说，最终却发现真相出人意料。传统剪辑制作，完整叙事结构。",
    src: "/videos/episode-1.mp4",
    poster: "/photos/mei跟加贝在海边.jpg",
  },
  {
    title: "水猴子 — 第二集",
    description: "续写水猴子系列故事。继续探索神秘与温情交织的叙事风格。",
    src: "/videos/episode-2.mp4",
    poster: "/photos/hichens跟加贝在海边.jpg",
  },
];

export default function WorksSection() {
  return (
    <section id="works" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="text-center">
          <h2 className="diary-title text-2xl sm:text-3xl">视频创作</h2>
          <p className="caption-text mt-2 text-sm">一些用镜头讲述的故事</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {WORKS.map((work) => (
            <div
              key={work.title}
              className="overflow-hidden rounded-lg border border-accent-gold/20 bg-bg-cream/85 shadow-paper backdrop-blur transition-all duration-300 hover:shadow-paper-hover"
            >
              <div className="relative aspect-video w-full bg-bg-warm">
                <video
                  className="h-full w-full object-cover"
                  src={work.src}
                  poster={work.poster}
                  controls
                  preload="metadata"
                >
                  您的浏览器不支持视频播放。
                </video>
              </div>
              <div className="p-5">
                <h3 className="diary-title mb-2 text-lg">{work.title}</h3>
                <p className="text-sm leading-relaxed text-text-muted">{work.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
