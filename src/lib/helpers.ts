import { mkdir } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { NOTE_EXTENSION } from "./constants";
import type { Config } from "./notes/types.ts";

export function titleToFilename(title: string): string {
  return `${title.trim().replace(/[/\\]/g, "-")}${NOTE_EXTENSION}`;
}

export function filenameToTitle(filename: string): string {
  return basename(filename, extname(filename));
}

export async function ensureNotesDir(config: Config): Promise<void> {
  await mkdir(config.notesDir, { recursive: true });
}

export function notePath(title: string, config: Config): string {
  return join(config.notesDir, titleToFilename(title));
}

export function dailyNotePath(config: Config): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return join(config.notesDir, "daily", `${dd}-${mm}-${yyyy}${NOTE_EXTENSION}`);
}

export function scratchpadPath(config: Config): string {
  return join(config.notesDir, `scratchpad${NOTE_EXTENSION}`);
}

export async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

export function openInEditor(filePath: string, editor: string, lineNum?: string): void {
  const [command, ...editorArgs] = editor.split(" ").filter(Boolean);
  if (!command) throw new Error("No editor configured. Set $EDITOR or $VISUAL.");
  const proc = Bun.spawnSync(
    [command, ...editorArgs, filePath, ...(lineNum ? [`+${lineNum}`] : [])],
    {
      stdio: ["inherit", "inherit", "inherit"],
    },
  );
  if (!proc.success) {
    throw new Error(`Editor "${editor}" exited with code ${proc.exitCode}.`);
  }
}

export function openWithGlow(path: string): void {
  const proc = Bun.spawnSync(["glow", "--tui", path], {
    stdio: ["inherit", "inherit", "inherit"],
  });
  if (!proc.success) {
    throw new Error(`glow exited with code ${proc.exitCode}.`);
  }
}

export function openExistingNote(filePath: string, config: Config, lineNum?: string): void {
  if (config.viewer === "glow") {
    openWithGlow(filePath);
    return;
  }

  openInEditor(filePath, config.editor, lineNum);
}
