# notes-cli

A minimal, terminal-based plain-text note-taking CLI. Notes are stored as `.txt` files in `~/.notes` (configurable) and opened in your `$EDITOR`.

Built with [Bun](https://bun.sh/) and zero runtime dependencies.

## Commands

| Command | Description |
|---|---|
| `notes new <title>` | Create or reopen a note |
| `notes daily` | Open today's daily note (`daily/dd-mm-yyyy.txt`) |
| `notes scratch` | Open the scratchpad |
| `notes find [query]` | Fuzzy-find note titles (requires [fzf](https://github.com/junegunn/fzf)) |
| `notes grep [pattern]` | Search note contents (requires `rg` + `fzf`) |
| `notes browse` | Browse notes directory (requires [yazi](https://github.com/sxyazi/yazi)) |
| `notes todo` | Interactive TUI todo list — parses `[ ]` / `[x]` from all notes |

## Install

```bash
git clone https://github.com/martin/notes-cli
cd notes-cli
bun install
bun link              # adds `notes` to your PATH
```

Or build a standalone binary:

```bash
bun run build
./notes help
```

## Configuration

| Env var | Default | Description |
|---|---|---|
| `NOTES_DIR` | `~/.notes` | Where notes are stored |
| `EDITOR` / `VISUAL` | `vi` | Editor to open notes with |

## Dev

```bash
bun start              # run without building
bun run check          # lint + format (Biome)
```

## License

All rights reserved.
