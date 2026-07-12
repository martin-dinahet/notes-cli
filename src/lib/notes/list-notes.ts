import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { NOTE_EXTENSION } from "../constants";
import { ensureNotesDir, filenameToTitle } from "../helpers";
import type { Config, Note } from "./types";

async function getAllNoteFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllNoteFiles(path)));
    } else if (entry.isFile() && entry.name.endsWith(NOTE_EXTENSION)) {
      files.push(path);
    }
  }

  return files;
}

export async function listNotes(config: Config): Promise<Note[]> {
  await ensureNotesDir(config);
  const files = await getAllNoteFiles(config.notesDir);

  return files.map((path) => ({ title: filenameToTitle(path), path }));
}
