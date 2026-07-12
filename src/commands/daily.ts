import { join } from "node:path";
import { dailyNotePath, ensureDir, openExistingNote, openInEditor } from "../lib/helpers.ts";
import { loadConfig } from "../lib/notes/load-config.ts";
import { createMarkdownNote, updateMarkdownNoteMetadata } from "../lib/notes/metadata.ts";

export async function runDaily(): Promise<void> {
  const config = loadConfig();
  await ensureDir(config.notesDir);
  await ensureDir(join(config.notesDir, "daily"));

  const path = dailyNotePath(config);
  const file = Bun.file(path);
  const exists = await file.exists();
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const date = `${dd}-${mm}-${yyyy}`;
  const title = `${date}: Daily note`;

  if (!exists) {
    await Bun.write(path, createMarkdownNote(title));
    console.log(`Created daily note for ${date}`);
  }

  await updateMarkdownNoteMetadata(path, title);
  if (exists) {
    openExistingNote(path, config);
  } else {
    openInEditor(path, config.editor);
  }
  await updateMarkdownNoteMetadata(path, title);
}
