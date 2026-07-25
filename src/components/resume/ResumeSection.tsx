import Image from "next/image";

const EXPERIENCE = [
  {
    period: "—",
    role: "待补充",
    company: "待补充",
    description: "在此处添加您的工作经历描述。",
  },
];

const EDUCATION = [
  {
    period: "—",
    school: "待补充",
    degree: "待补充",
  },
];

const SKILL_TAGS = [
  "React", "Next.js", "TypeScript", "Tailwind CSS",
  "Node.js", "Python", "PostgreSQL", "Docker", "Git",
];

export default function ResumeSection() {
  return (
    <section id="resume" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-10">
          <div className="shrink-0">
            <Image
              src="/photos/本人正面照.jpg"
              alt="Mei"
              width={120}
              height={120}
              className="avatar-ring size-[120px] object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-col gap-3 text-center md:text-left">
            <h2 className="diary-title text-3xl sm:text-4xl">Mei</h2>
            <p className="max-w-lg text-lg leading-relaxed text-text-secondary">
              待补充个人介绍。请在此处添加关于您的简短描述。
            </p>
          </div>
        </div>

        {/* Experience */}
        <div>
          <h3 className="diary-title mb-8 text-2xl">工作经历</h3>
          <div className="relative space-y-8 border-l-2 border-accent-gold/40 pl-6">
            {EXPERIENCE.map((item) => (
              <div key={item.role} className="relative">
                <div className="absolute -left-[26px] size-3 rounded-full border-2 border-accent-gold bg-bg-cream" />
                <span className="text-xs text-accent-gold">{item.period}</span>
                <h4 className="font-semibold text-text-primary">{item.role}</h4>
                <p className="text-sm text-accent-rose">{item.company}</p>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <h3 className="diary-title mb-8 text-2xl">教育背景</h3>
          <div className="relative space-y-6 border-l-2 border-accent-gold/40 pl-6">
            {EDUCATION.map((item) => (
              <div key={item.school} className="relative">
                <div className="absolute -left-[26px] size-3 rounded-full border-2 border-accent-gold bg-bg-cream" />
                <span className="text-xs text-accent-gold">{item.period}</span>
                <h4 className="font-semibold text-text-primary">{item.school}</h4>
                <p className="text-sm text-text-muted">{item.degree}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <h3 className="diary-title mb-8 text-2xl">技能</h3>
          <div className="flex flex-wrap gap-3">
            {SKILL_TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-accent-gold/40 bg-bg-paper px-4 py-2 text-sm text-text-secondary shadow-paper transition-all duration-300 hover:border-accent-gold hover:text-accent-gold"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
