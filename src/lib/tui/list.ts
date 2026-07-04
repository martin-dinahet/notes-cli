import { term } from "./screen.ts";
import type { List, Screen as TuiScreen } from "./types.ts";

export function createList(_screen: TuiScreen, height: string): List {
  const subtract = height.startsWith("100%-") ? Number.parseInt(height.slice(5), 10) : 0;
  const maxRows = term.height - (Number.isNaN(subtract) ? 0 : subtract);

  let items: string[] = [];
  let selectedIndex = 0;

  term.on("key", (name: string) => {
    if (name === "UP" || name === "k") {
      if (selectedIndex > 0) {
        selectedIndex--;
        render();
      }
    } else if (name === "DOWN" || name === "j") {
      if (selectedIndex < items.length - 1) {
        selectedIndex++;
        render();
      }
    }
  });

  function render() {
    for (let i = 0; i < maxRows; i++) {
      term.moveTo(1, i + 1);
      term.eraseLine();
      if (i < items.length) {
        if (i === selectedIndex) {
          term.bgWhite.black(` ${items[i]} `);
        } else {
          term(` ${items[i]} `);
        }
      }
    }
  }

  return {
    setItems: (newItems) => {
      items = newItems;
      if (selectedIndex >= items.length) {
        selectedIndex = Math.max(0, items.length - 1);
      }
      render();
    },
    select: (index) => {
      selectedIndex = index;
      render();
    },
    getSelected: () => selectedIndex,
    focus: () => {},
  };
}
