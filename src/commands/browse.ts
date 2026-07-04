import { loadConfig } from "../lib/notes/load-config.ts";

export async function runBrowse(): Promise<void> {
  const config = loadConfig();

  const proc = Bun.spawnSync(["yazi", config.notesDir], {
    stdio: ["inherit", "inherit", "inherit"],
  });

  if (!proc.success) process.exit(proc.exitCode);
}
