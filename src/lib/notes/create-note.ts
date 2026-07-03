import type { Config, CreateNoteResult } from "../../types";
import { ensureNotesDir, notePath } from "../helpers";

export async function createNote(title: string, config: Config): Promise<CreateNoteResult> {
  if (!title.trim()) throw new Error("Note title cannot be empty.");
  await ensureNotesDir(config);
  const path = notePath(title, config);
  const file = Bun.file(path);
  const alreadyExists = await file.exists();
  if (!alreadyExists) await Bun.write(path, "");
  return { status: alreadyExists ? "exists" : "created", path };
}
