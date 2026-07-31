import Image from "next/image";
import type { ResumeData, ResumeItem, EducationItem } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";
import { proxyImageUrl } from "@/lib/image";

interface ResumeSectionProps {
  data: ResumeData;
}

export default function ResumeSection({ data }: ResumeSectionProps) {
  const { isAdmin, permissions } = useAuth();
  const showPhoto = isAdmin || permissions.resume_photo === true;
  return (
    <section id="resume" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-16">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-10">
          <div className="shrink-0">
            {showPhoto && data.avatar ? (
              <Image
                src={proxyImageUrl(data.avatar)}
                alt={data.name}
                width={120}
                height={120}
                className="avatar-ring size-[120px] object-cover"
                unoptimized
              />
            ) : (
              <div className="avatar-ring flex size-[120px] items-center justify-center bg-bg-warm">
                <span className="font-display text-2xl text-text-muted">?</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 text-center md:text-left">
            <h2 className="diary-title text-3xl sm:text-4xl">{data.name}</h2>
            <p className="max-w-lg text-lg leading-relaxed text-text-secondary">{data.bio}</p>
          </div>
        </div>

        {data.experience.length > 0 && (
          <div>
            <h3 className="diary-title mb-8 text-2xl">工作经历</h3>
            <div className="relative space-y-8 border-l-2 border-accent-gold/40 pl-6">
              {data.experience.map((item, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[26px] size-3 rounded-full border-2 border-accent-gold bg-bg-cream" />
                  <span className="text-xs text-accent-gold">{item.period}</span>
                  <h4 className="font-semibold text-text-primary">{item.role}</h4>
                  <p className="text-sm text-accent-rose">{item.company}</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-muted">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.education.length > 0 && (
          <div>
            <h3 className="diary-title mb-8 text-2xl">教育背景</h3>
            <div className="relative space-y-6 border-l-2 border-accent-gold/40 pl-6">
              {data.education.map((item, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[26px] size-3 rounded-full border-2 border-accent-gold bg-bg-cream" />
                  <span className="text-xs text-accent-gold">{item.period}</span>
                  <h4 className="font-semibold text-text-primary">{item.school}</h4>
                  <p className="text-sm text-text-muted">{item.degree}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.skills.length > 0 && (
          <div>
            <h3 className="diary-title mb-8 text-2xl">技能</h3>
            <div className="flex flex-wrap gap-3">
              {data.skills.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-accent-gold/40 bg-bg-paper px-4 py-2 text-sm text-text-secondary shadow-paper transition-all duration-300 hover:border-accent-gold hover:text-accent-gold"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
