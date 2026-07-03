import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import blessed from "blessed";
import { NOTE_EXTENSION, TODO_RE } from "../lib/constants.ts";
import { loadConfig } from "../lib/notes/load-config.ts";

interface ParsedTodo {
  filePath: string;
  lineNum: number;
  text: string;
  checked: boolean;
}

async function getAllNoteFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllNoteFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(NOTE_EXTENSION)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function findAllTodos(notesDir: string): Promise<ParsedTodo[]> {
  const noteFiles = await getAllNoteFiles(notesDir);
  const todos: ParsedTodo[] = [];

  for (const filePath of noteFiles) {
    const content = await readFile(filePath, "utf-8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const m = line.match(TODO_RE);
      if (m) {
        todos.push({
          filePath,
          lineNum: i + 1,
          text: m[2] ?? "",
          checked: m[1] === "x",
        });
      }
    }
  }

  return todos;
}

async function toggleTodoItem(todo: ParsedTodo): Promise<void> {
  const content = await readFile(todo.filePath, "utf-8");
  const lines = content.split("\n");
  const idx = todo.lineNum - 1;

  if (idx < 0 || idx >= lines.length) return;

  const line = lines[idx];
  if (!line) return;

  if (todo.checked) {
    lines[idx] = line.replace("[x]", "[ ]");
  } else {
    lines[idx] = line.replace("[ ]", "[x]");
  }

  await writeFile(todo.filePath, lines.join("\n"), "utf-8");
  todo.checked = !todo.checked;
}

function formatTodo(todo: ParsedTodo): string {
  if (todo.checked) {
    return `[x] ${todo.text}`;
  }
  return `[ ] ${todo.text}`;
}

export async function runTodo(): Promise<void> {
  const config = loadConfig();

  let allTodos: ParsedTodo[];
  try {
    allTodos = await findAllTodos(config.notesDir);
  } catch (err) {
    console.error(`Error reading notes: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }

  if (allTodos.length === 0) {
    console.log("No todos found in any notes.");
    return;
  }

  allTodos.sort((a, b) => (a.checked === b.checked ? 0 : a.checked ? 1 : -1));

  let showOnlyUnchecked = false;

  function getVisibleTodos(): ParsedTodo[] {
    return showOnlyUnchecked ? allTodos.filter((t) => !t.checked) : allTodos;
  }

  const screen = blessed.screen({
    smartCSR: true,
    title: "notes todo",
  });

  const list = blessed.list({
    parent: screen,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%-1",
    keys: true,
    vi: true,
    tags: true,
    invertSelected: false,
    style: {
      selected: {
        fg: "black",
        bg: "white",
      },
    },
  });

  function getSelectedIndex(): number {
    return (list as unknown as { selected: number }).selected;
  }

  function updateList(): void {
    const visible = getVisibleTodos();
    const prevSelected = getSelectedIndex();
    list.setItems(visible.map(formatTodo));
    if (visible.length > 0) {
      list.select(Math.min(prevSelected, visible.length - 1));
    }
    screen.render();
  }

  const statusBar = blessed.box({
    parent: screen,
    bottom: 0,
    left: 2,
    width: "100%",
    height: 1,
    tags: true,
    content: "",
  });

  function updateStatus(): void {
    const visible = getVisibleTodos();
    const doneCount = allTodos.filter((t) => t.checked).length;
    const total = allTodos.length;
    const parts = [`${visible.length} shown`, `${doneCount}/${total} done`];
    if (showOnlyUnchecked) parts.push("filter: unchecked only");
    statusBar.setContent(parts.join(" | "));
    screen.render();
  }

  screen.key(["space"], () => {
    const visible = getVisibleTodos();
    const idx = getSelectedIndex();
    const todo = visible[idx];
    if (!todo) return;
    toggleTodoItem(todo).then(() => {
      updateList();
      updateStatus();
    });
  });

  screen.key(["f"], () => {
    showOnlyUnchecked = !showOnlyUnchecked;
    list.select(0);
    updateList();
    updateStatus();
  });

  screen.key(["q", "escape", "C-c"], () => {
    screen.destroy();
    process.exit(0);
  });

  updateList();
  updateStatus();
  list.focus();
  screen.render();
}
