import { join } from "node:path";
import { dailyNotePath, ensureDir, openInEditor } from "../lib/helpers.ts";
import { loadConfig } from "../lib/notes/load-config.ts";

export async function runDaily(): Promise<void> {
  const config = loadConfig();
  await ensureDir(config.notesDir);
  await ensureDir(join(config.notesDir, "daily"));

  const path = dailyNotePath(config);
  const file = Bun.file(path);
  const exists = await file.exists();

  if (!exists) {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const date = `${dd}-${mm}-${yyyy}`;
    const title = `${date}: Daily note`;
    await Bun.write(path, `${title}\n${"=".repeat(title.length)}\n\n`);
    console.log(`Created daily note for ${date}`);
  }

  openInEditor(path, config.editor);
}
