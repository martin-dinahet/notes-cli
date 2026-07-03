#!/usr/bin/env bun

import { runCreate } from "./commands/create.ts";
import { runDaily } from "./commands/daily.ts";
import { runFind } from "./commands/find.ts";
import { runGrep } from "./commands/grep.ts";
import { runScratch } from "./commands/scratch.ts";
import { runTodo } from "./commands/todo.ts";

const HELP = `notes - plain-text note taking in your terminal

Usage:
  notes new <title>      Create (or reopen) a note and edit it in $EDITOR
  notes daily            Open today's daily note
  notes scratch          Open the scratchpad
  notes find [query]     Fuzzy-find notes by title (uses fzf)
  notes grep [pattern]   Search note content with ripgrep + fzf
  notes todo             Interactive todo list from all notes

Config:
  NOTES_DIR   Where notes are stored (default: ~/.notes)
  EDITOR      Editor to open notes with (default: vi)
`;

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case "new":
      await runCreate(args);
      break;
    case "daily":
      await runDaily();
      break;
    case "scratch":
      await runScratch();
      break;
    case "find":
      await runFind(args);
      break;
    case "grep":
      await runGrep(args);
      break;
    case "todo":
      await runTodo();
      break;
    case "help":
    case "--help":
    case "-h":
    case undefined:
      console.log(HELP);
      break;
    default:
      console.error(`Unknown command: ${command}\n`);
      console.log(HELP);
      process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
