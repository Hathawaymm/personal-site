import Image from "next/image";

const MEMBERS = [
  {
    name: "Mei",
    label: "铲屎官 · 视频创作者",
    description: "养了三只毛孩子和一个男朋友的快乐生活",
    src: "/photos/本人正面照.jpg",
  },
  {
    name: "Hichens",
    label: "男朋友",
    description: "温暖可靠的另一半，一起经营我们的小生活",
    src: "/photos/hichens.jpg",
  },
  {
    name: "加贝",
    label: "黑白边牧 · 大姐",
    description: "三只里的老大，聪明活泼，家里的智商担当",
    src: "/photos/加贝正面照.jpg",
  },
  {
    name: "Emo",
    label: "全橘 · 哥哥 · 贪吃",
    description: "一身橘毛的阳光男孩，最大的爱好是干饭和晒太阳",
    src: "/photos/emo.jpg",
  },
  {
    name: "Joy",
    label: "白底橘纹 · 妹妹 · 优雅",
    description: "身上带着淡淡的橘色花纹，尾巴也是橘的，最优雅的小公主",
    src: "/photos/joy.jpg",
  },
];

export default function FamilySection() {
  return (
    <section id="family" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="text-center">
          <h2 className="diary-title text-2xl sm:text-3xl">我们的家庭</h2>
          <p className="caption-text mt-2 text-sm">两个人和三只毛孩子的温暖日常</p>
        </div>

        <div className="flex flex-wrap items-start justify-center gap-8 sm:gap-12">
          {MEMBERS.map((member) => (
            <div key={member.name} className="flex w-36 flex-col items-center gap-3 text-center sm:w-40">
              <Image
                src={member.src}
                alt={member.name}
                width={128}
                height={128}
                className="avatar-ring size-28 object-cover transition-transform duration-300 hover:scale-105 sm:size-32"
                unoptimized
              />
              <div>
                <h3 className="diary-title text-lg">{member.name}</h3>
                <p className="mt-1 text-xs text-accent-gold">{member.label}</p>
                <p className="mt-2 text-xs leading-relaxed text-text-muted">{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
