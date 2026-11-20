import type { Metadata } from "next";
import DeskExperience from "@/components/desk/DeskExperience";

export const metadata: Metadata = {
  title: "张寒梅 · 3D 书房 | Hanmei Zhang",
  description: "进入张寒梅的 3D 书房，打开 ZoeOS 98 查看项目、流程治理和简历。无需登录。",
  robots: { index: true, follow: true },
};

export default function DeskPage() {
  return <DeskExperience />;
}
