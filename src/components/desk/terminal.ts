import { tx, type Lang } from "@/data/portfolio-data";
import { seedCareerDocument, type CareerDocument } from "@/data/career-document";

export interface CommandResult {
  lines: string[];
  action?: "clear" | "toggle-lang";
}

export function runCommand(raw: string, lang: Lang, source?: Partial<Pick<CareerDocument, "profile" | "keyboardSkills" | "projects" | "governance" | "terminal">>): CommandResult {
  const data = { ...seedCareerDocument(), ...source };
  const { profile, keyboardSkills, projects, governance, terminal } = data;
  const command = raw.trim().toLowerCase();
  if (!command) return { lines: [] };
  if (command === "clear") return { lines: [], action: "clear" };
  if (command === "help") {
    return { lines: [tx(terminal.help, lang)] };
  }
  if (command === "whoami") {
    return { lines: [tx(profile.name, lang), tx(profile.title, lang), tx(profile.kicker, lang)] };
  }
  if (command === "skills") {
    return { lines: keyboardSkills.map((skill) => `${tx(skill.label, lang)} — ${tx(skill.proof, lang)}`) };
  }
  if (command === "projects") {
    return { lines: projects.map((project) => `${tx(project.title, lang)} (${project.period})`) };
  }
  if (command === "audit") {
    return { lines: [tx(governance.audit.title, lang), ...governance.audit.stages.map((stage, index) => `${index + 1}. ${tx(stage.title, lang)}`)] };
  }
  if (command === "contact") {
    return { lines: [profile.email, profile.github, tx(profile.location, lang)] };
  }
  if (command === "lang") {
    return {
      lines: [lang === "zh" ? "切换到 English" : "Switch to 中文"],
      action: "toggle-lang",
    };
  }
  if (command === "portfolio") {
    return { lines: ["/portfolio", "/desk", "/resume"] };
  }
  return { lines: [tx(terminal.unknown, lang).replaceAll("{command}", command)] };
}
