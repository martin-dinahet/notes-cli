import { mkdir } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import type { Config } from "../types.ts";
import { NOTE_EXTENSION } from "./constants";

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
