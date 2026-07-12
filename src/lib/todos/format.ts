import type { ParsedTodo } from "./types";

export function formatTodo(todo: ParsedTodo): string {
  if (todo.checked) {
    return `- [x] ${todo.text}`;
  }
  return `- [ ] ${todo.text}`;
}
