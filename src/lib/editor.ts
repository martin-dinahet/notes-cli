export function openInEditor(filePath: string, editor: string): void {
  const [command, ...editorArgs] = editor.split(" ").filter(Boolean);
  if (!command) throw new Error("No editor configured. Set $EDITOR or $VISUAL.");
  const proc = Bun.spawnSync([command, ...editorArgs, filePath], {
    stdio: ["inherit", "inherit", "inherit"],
  });
  if (!proc.success) {
    throw new Error(`Editor "${editor}" exited with code ${proc.exitCode}.`);
  }
}
