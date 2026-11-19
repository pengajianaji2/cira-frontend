import type { CreateSprintInput } from "../types/sprints.types";

type ParsedSprintTemplate = CreateSprintInput & { errors: string[] };

function cleanTemplateLines(value: string): string[] {
  return value
    .replace(/^\s*```[^\n]*\n|\n\s*```\s*$/g, "")
    .split(/\r?\n/)
    .map((line) => line
      .replace(/^\s*\*\*(SPRINT|GOAL|START|END|TASKS)\s*:\*\*\s*/i, "$1: ")
      .replace(/^\s*\*\*(SPRINT|GOAL|START|END|TASKS)\*\*\s*:?\s*/i, "$1: ")
      .replace(/^\s*\*\*(.*?)\*\*\s*$/, "$1")
      .trim());
}

function readField(lines: string[], field: string): string {
  const line = lines.find((item) => new RegExp(`^${field}\\s*:`, "i").test(item));
  return line?.replace(new RegExp(`^${field}\\s*:`, "i"), "").trim() ?? "";
}

export function parseSprintTemplate(value: string): ParsedSprintTemplate {
  const lines = cleanTemplateLines(value);
  const taskHeaderIndex = lines.findIndex((line) => /^TASKS\s*:?$/i.test(line));
  const errors: string[] = [];
  const tasks: NonNullable<CreateSprintInput["tasks"]> = [];

  if (taskHeaderIndex >= 0) {
    for (const line of lines.slice(taskHeaderIndex + 1)) {
      const taskLine = line.replace(/^(?:[-*+]\s+|\d+[.)]\s+)/, "");
      const match = taskLine.match(/^\[(LOW|MEDIUM|HIGH|URGENT)\]\s*(.*)$/i);
      if (match) {
        const title = match[2].trim();
        if (!title) errors.push("Setiap Todo perlu memiliki judul setelah prioritas.");
        else tasks.push({ title, priority: match[1].toLowerCase() as "low" | "medium" | "high" | "urgent" });
        continue;
      }

      if (/^(?:[-*+]\s+|\d+[.)]\s+)/.test(line)) {
        const title = taskLine.trim();
        if (title) tasks.push({ title, priority: "medium" });
        continue;
      }

      if (/^>\s*/.test(line) && tasks.length) {
        tasks[tasks.length - 1].description = line.replace(/^>\s*/, "").trim();
      }
    }
  }

  const name = readField(lines, "SPRINT");
  if (!name) errors.unshift("Isi nama sprint dengan format SPRINT: Nama Sprint.");
  if (taskHeaderIndex < 0 || tasks.length === 0) {
    errors.push("Tambahkan TASKS: dan minimal satu Todo, misalnya - [MEDIUM] Judul task.");
  }

  return {
    name,
    goal: readField(lines, "GOAL") || undefined,
    startDate: readField(lines, "START") || undefined,
    endDate: readField(lines, "END") || undefined,
    tasks,
    errors,
  };
}
