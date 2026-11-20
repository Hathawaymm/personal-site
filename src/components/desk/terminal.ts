import { governance, keyboardSkills, profile, projects, tx, type Lang } from "@/data/portfolio-data";

export interface CommandResult {
  lines: string[];
  action?: "clear" | "toggle-lang";
}

export function runCommand(raw: string, lang: Lang): CommandResult {
  const command = raw.trim().toLowerCase();
  if (!command) return { lines: [] };
  if (command === "clear") return { lines: [], action: "clear" };
  if (command === "help") {
    return {
      lines: lang === "zh"
        ? ["help · whoami · skills · projects · audit · contact · lang · portfolio · clear"]
        : ["help · whoami · skills · projects · audit · contact · lang · portfolio · clear"],
    };
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
  return { lines: [lang === "zh" ? `未知命令：${command}。输入 help。` : `Unknown command: ${command}. Type help.`] };
}
