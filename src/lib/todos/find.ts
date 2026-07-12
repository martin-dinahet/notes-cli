import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { NOTE_EXTENSION, TODO_RE } from "../constants";
import type { ParsedTodo } from "./types";

async function getAllNoteFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllNoteFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(NOTE_EXTENSION)) {
      files.push(fullPath);
    }
  }
  return files;
}

export async function findAllTodos(notesDir: string): Promise<ParsedTodo[]> {
  const noteFiles = await getAllNoteFiles(notesDir);
  const todos: ParsedTodo[] = [];

  for (const filePath of noteFiles) {
    const content = await readFile(filePath, "utf-8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const m = line.match(TODO_RE);
      if (m) {
        todos.push({
          filePath,
          lineNum: i + 1,
          text: m[4] ?? "",
          checked: (m[3] ?? "").toLowerCase() === "x",
        });
      }
    }
  }

  return todos;
}
