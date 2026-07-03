import { loadConfig } from "../lib/notes/load-config.ts";
import { findAllTodos } from "../lib/todos/find.ts";
import { formatTodo } from "../lib/todos/format.ts";
import { toggleTodoItem } from "../lib/todos/toggle.ts";
import type { ParsedTodo } from "../lib/todos/types.ts";
import { createList } from "../lib/tui/list.ts";
import { createScreen } from "../lib/tui/screen.ts";
import { createStatusBar } from "../lib/tui/status-bar.ts";

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

  const screen = createScreen("notes todo");
  const list = createList(screen, "100%-1");
  const statusBar = createStatusBar(screen);

  let showOnlyUnchecked = false;

  function getVisibleTodos(): ParsedTodo[] {
    return showOnlyUnchecked ? allTodos.filter((t) => !t.checked) : allTodos;
  }

  function updateList(): void {
    const visible = getVisibleTodos();
    const prev = list.getSelected();
    list.setItems(visible.map(formatTodo));
    if (visible.length > 0) {
      list.select(Math.min(prev, visible.length - 1));
    }
    screen.render();
  }

  function updateStatus(): void {
    const visible = getVisibleTodos();
    const done = allTodos.filter((t) => t.checked).length;
    const total = allTodos.length;
    const parts = [`${visible.length} shown`, `${done}/${total} done`];
    if (showOnlyUnchecked) parts.push("filter: unchecked only");
    statusBar.setContent(parts.join(" | "));
    screen.render();
  }

  screen.onKey(["space"], () => {
    const visible = getVisibleTodos();
    const todo = visible[list.getSelected()];
    if (!todo) return;
    toggleTodoItem(todo).then(() => {
      updateList();
      updateStatus();
    });
  });

  screen.onKey(["f"], () => {
    showOnlyUnchecked = !showOnlyUnchecked;
    list.select(0);
    updateList();
    updateStatus();
  });

  screen.onKey(["q", "escape", "C-c"], () => {
    screen.destroy();
    process.exit(0);
  });

  updateList();
  updateStatus();
  list.focus();
  screen.render();
}
