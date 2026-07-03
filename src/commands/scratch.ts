import { ensureDir, openInEditor, scratchpadPath } from "../lib/helpers.ts";
import { loadConfig } from "../lib/notes/load-config.ts";

export async function runScratch(): Promise<void> {
  const config = loadConfig();
  await ensureDir(config.notesDir);

  const path = scratchpadPath(config);
  const file = Bun.file(path);
  const exists = await file.exists();

  if (!exists) {
    await Bun.write(path, "");
    console.log("Created scratchpad");
  }

  openInEditor(path, config.editor);
}
