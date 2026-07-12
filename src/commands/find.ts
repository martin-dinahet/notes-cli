import { basename } from "node:path";
import { NOTE_EXTENSION } from "../lib/constants.ts";
import { filenameToTitle, scratchpadPath } from "../lib/helpers.ts";
import { loadConfig } from "../lib/notes/load-config.ts";
import { updateMarkdownNoteMetadata } from "../lib/notes/metadata.ts";

export async function runFind(args: string[]): Promise<void> {
  const config = loadConfig();
  const query = args.join(" ").trim();

  const find = Bun.spawn(["find", config.notesDir, "-name", `*${NOTE_EXTENSION}`, "-type", "f"], {
    stdout: "pipe",
  });
  const awk = Bun.spawn(
    ["awk", `{ t=$0; sub(/.*\\//,"",t); sub(/\\${NOTE_EXTENSION}$/,"",t); print t "\t" $0 }`],
    { stdin: find.stdout, stdout: "pipe" },
  );

  const fzfArgs = ["--reverse", "--with-nth=1", "--delimiter=\t"];
  if (query) fzfArgs.push("--query", query);

  const fzf = Bun.spawn(["fzf", ...fzfArgs], {
    stdin: awk.stdout,
    stdout: "pipe",
    stderr: "inherit",
  });

  const output = await new Response(fzf.stdout).text();
  const selection = output.trim();
  if (!selection) return;

  const path = selection.includes("\t") ? selection.split("\t").slice(1).join("\t") : selection;
  const title = filenameToTitle(basename(path));
  const isScratchpad = path === scratchpadPath(config);
  if (!isScratchpad) await updateMarkdownNoteMetadata(path, title);

  const [cmd = "", ...editorArgs] = config.editor.split(" ").filter(Boolean);
  if (!cmd) throw new Error("No editor configured. Set $EDITOR or $VISUAL.");
  const proc = Bun.spawnSync([cmd, ...editorArgs, path], {
    stdio: ["inherit", "inherit", "inherit"],
  });
  if (!proc.success) process.exit(proc.exitCode);
  if (!isScratchpad) await updateMarkdownNoteMetadata(path, title);
}
