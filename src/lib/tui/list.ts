import blessed from "blessed";
import { getBlessed } from "./screen.ts";
import type { List, Screen } from "./types.ts";

export function createList(screen: Screen, height: string): List {
  const bs = getBlessed(screen);
  const list = blessed.list({
    parent: bs,
    top: 0,
    left: 0,
    width: "100%",
    height,
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

  return {
    setItems: (items) => {
      list.setItems(items);
    },
    select: (index) => {
      list.select(index);
    },
    getSelected: () => (list as unknown as { selected: number }).selected,
    focus: () => {
      list.focus();
    },
  };
}
