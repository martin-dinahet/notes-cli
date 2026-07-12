import { readFile, writeFile } from "node:fs/promises";
import { TODO_RE } from "../constants";
import type { ParsedTodo } from "./types";

export async function toggleTodoItem(todo: ParsedTodo): Promise<void> {
  const content = await readFile(todo.filePath, "utf-8");
  const lines = content.split("\n");
  const idx = todo.lineNum - 1;

  if (idx < 0 || idx >= lines.length) return;

  const line = lines[idx];
  if (!line) return;

  lines[idx] = line.replace(
    TODO_RE,
    (_match, indent: string, marker: string, checked: string, text: string) => {
      const next = checked.toLowerCase() === "x" ? " " : "x";
      return `${indent}${marker} [${next}] ${text}`;
    },
  );

  await writeFile(todo.filePath, lines.join("\n"), "utf-8");
  todo.checked = !todo.checked;
}
