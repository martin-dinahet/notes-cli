import { readFile, writeFile } from "node:fs/promises";
import type { ParsedTodo } from "./types";

export async function toggleTodoItem(todo: ParsedTodo): Promise<void> {
  const content = await readFile(todo.filePath, "utf-8");
  const lines = content.split("\n");
  const idx = todo.lineNum - 1;

  if (idx < 0 || idx >= lines.length) return;

  const line = lines[idx];
  if (!line) return;

  if (todo.checked) {
    lines[idx] = line.replace("[x]", "[ ]");
  } else {
    lines[idx] = line.replace("[ ]", "[x]");
  }

  await writeFile(todo.filePath, lines.join("\n"), "utf-8");
  todo.checked = !todo.checked;
}
