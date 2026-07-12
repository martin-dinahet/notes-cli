import { openInEditor } from "../lib/helpers.ts";
import { createNote } from "../lib/notes/create-note.ts";
import { loadConfig } from "../lib/notes/load-config.ts";
import { updateMarkdownNoteMetadata } from "../lib/notes/metadata.ts";

export async function runCreate(args: string[]): Promise<void> {
  const title = args.join(" ").trim();
  if (!title) {
    console.error("Usage: notes new <title>");
    process.exit(1);
  }
  const config = loadConfig();
  const { path, status } = await createNote(title, config);
  console.log(status === "created" ? `Created "${title}"` : `Opening existing note "${title}"`);
  await updateMarkdownNoteMetadata(path, title);
  openInEditor(path, config.editor);
  await updateMarkdownNoteMetadata(path, title);
}
