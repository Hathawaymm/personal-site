import Image from "next/image";
import type { FamilyMember } from "@/lib/data";
import { proxyImageUrl } from "@/lib/image";

interface FamilySectionProps {
  members: FamilyMember[];
  title?: string;
  subtitle?: string;
}

export default function FamilySection({ members, title = "我们的家庭", subtitle = "两个人和三只毛孩子的温暖日常" }: FamilySectionProps) {
  if (members.length === 0) return null;

  return (
    <section id="family" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="text-center">
          <h2 className="diary-title text-2xl sm:text-3xl">{title}</h2>
          <p className="caption-text mt-2 text-sm">{subtitle}</p>
        </div>

      <div className="flex flex-wrap items-start justify-center gap-10 sm:gap-12">
        {members.filter(m => m.avatar).map((member) => (
            <div key={member.name} className="flex w-40 flex-col items-center gap-3 text-center sm:w-44">
              {member.avatar ? (
                <Image
                  src={proxyImageUrl(member.avatar)}
                  alt={member.name}
                  width={160}
                  height={160}
                  className="avatar-ring size-32 object-cover transition-transform duration-300 hover:scale-105 sm:size-36"
                  unoptimized
                />
              ) : (
                <div className="avatar-ring flex size-32 items-center justify-center bg-bg-warm sm:size-36">
                  <span className="text-2xl text-text-muted">?</span>
                </div>
              )}
              <div>
                <h3 className="diary-title text-lg">{member.name}</h3>
                {member.label && <p className="mt-1 text-sm text-gold-strong">{member.label}</p>}
                {member.description && <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{member.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
