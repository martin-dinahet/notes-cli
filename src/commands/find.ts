import { basename } from "node:path";
import { filenameToTitle, openExistingNote, scratchpadPath } from "../lib/helpers.ts";
import { listNotes } from "../lib/notes/list-notes.ts";
import { loadConfig } from "../lib/notes/load-config.ts";
import { updateMarkdownNoteMetadata } from "../lib/notes/metadata.ts";

export async function runFind(args: string[]): Promise<void> {
  const config = loadConfig();
  const query = args.join(" ").trim();
  const notes = await listNotes(config);
  const input = notes.map((note) => `${note.title}\t${note.path}`).join("\n");

  const fzfArgs = ["--reverse", "--with-nth=1", "--delimiter=\t"];
  if (query) fzfArgs.push("--query", query);

  const fzf = Bun.spawn(["fzf", ...fzfArgs], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "inherit",
  });
  fzf.stdin.write(input);
  fzf.stdin.end();

  const output = await new Response(fzf.stdout).text();
  const selection = output.trim();
  if (!selection) return;

  const path = selection.includes("\t") ? selection.split("\t").slice(1).join("\t") : selection;
  const title = filenameToTitle(basename(path));
  const isScratchpad = path === scratchpadPath(config);
  if (!isScratchpad) await updateMarkdownNoteMetadata(path, title);

  openExistingNote(path, config);
  if (!isScratchpad) await updateMarkdownNoteMetadata(path, title);
}
