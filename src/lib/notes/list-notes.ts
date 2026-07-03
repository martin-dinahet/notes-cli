import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { NOTE_EXTENSION } from "../constants";
import { ensureNotesDir, filenameToTitle } from "../helpers";
import type { Config, Note } from "./types";

export async function listNotes(config: Config): Promise<Note[]> {
  await ensureNotesDir(config);
  const entries = await readdir(config.notesDir, { withFileTypes: true });

  return entries
    .filter((e) => e.isFile() && e.name.endsWith(NOTE_EXTENSION))
    .map((e) => ({ title: filenameToTitle(e.name), path: join(config.notesDir, e.name) }));
}
