import { loadConfig } from "../lib/notes/load-config.ts";

export async function runGrep(args: string[]): Promise<void> {
  const config = loadConfig();
  const input = args.join(" ").trim();

  const rgArgs = ["--line-number", "--no-heading", "--color=always", "--"];
  rgArgs.push(input || ".", config.notesDir);

  const rg = Bun.spawn(["rg", ...rgArgs], { stdout: "pipe" });

  const fzf = Bun.spawn(["fzf", "--reverse", "--ansi"], {
    stdin: rg.stdout,
    stdout: "pipe",
    stderr: "inherit",
  });

  const output = await new Response(fzf.stdout).text();
  const selection = output.trim();
  if (!selection) return;

  const m = selection.match(/^(.+?):(\d+):/);
  if (!m) return;

  const [, path, lineNum] = m;
  const [cmd, ...editorArgs] = config.editor.split(" ").filter(Boolean);
  const isVsCode = cmd?.includes("code");

  const editorPath = isVsCode ? [`${path}:${lineNum}`] : [path, `+${lineNum}`];

  const proc = Bun.spawnSync([cmd, ...editorArgs, ...editorPath], {
    stdio: ["inherit", "inherit", "inherit"],
  });
  if (!proc.success) process.exit(proc.exitCode);
}
