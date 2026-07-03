import { homedir } from "node:os";
import { join } from "node:path";
import type { Config } from "./types.ts";

export function loadConfig(): Config {
  const notesDir = process.env.NOTES_DIR ?? join(homedir(), ".notes");
  const editor = process.env.EDITOR ?? process.env.VISUAL ?? "vi";
  return { notesDir, editor };
}
