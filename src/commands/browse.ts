import { openWithGlow } from "../lib/helpers.ts";
import { loadConfig } from "../lib/notes/load-config.ts";

export async function runBrowse(): Promise<void> {
  const config = loadConfig();

  if (config.viewer === "glow") {
    openWithGlow(config.notesDir);
    return;
  }

  const proc = Bun.spawnSync(["yazi", config.notesDir], {
    stdio: ["inherit", "inherit", "inherit"],
  });

  if (!proc.success) process.exit(proc.exitCode);
}
