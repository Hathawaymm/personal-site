import Image from "next/image";
import type { FamilyMember } from "@/lib/data";

interface FamilySectionProps {
  members: FamilyMember[];
}

export default function FamilySection({ members }: FamilySectionProps) {
  if (members.length === 0) return null;

  return (
    <section id="family" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="text-center">
          <h2 className="diary-title text-2xl sm:text-3xl">我们的家庭</h2>
          <p className="caption-text mt-2 text-sm">两个人和三只毛孩子的温暖日常</p>
        </div>

      <div className="flex flex-wrap items-start justify-center gap-8 sm:gap-12">
        {members.filter(m => m.avatar).map((member) => (
            <div key={member.name} className="flex w-36 flex-col items-center gap-3 text-center sm:w-40">
              {member.avatar ? (
                <Image
                  src={member.avatar}
                  alt={member.name}
                  width={128}
                  height={128}
                  className="avatar-ring size-28 object-cover transition-transform duration-300 hover:scale-105 sm:size-32"
                  unoptimized
                />
              ) : (
                <div className="avatar-ring flex size-28 items-center justify-center bg-bg-warm sm:size-32">
                  <span className="text-2xl text-text-muted">?</span>
                </div>
              )}
              <div>
                <h3 className="diary-title text-lg">{member.name}</h3>
                {member.label && <p className="mt-1 text-xs text-accent-gold">{member.label}</p>}
                {member.description && <p className="mt-2 text-xs leading-relaxed text-text-muted">{member.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
