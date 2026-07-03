import type { Widgets } from "blessed";
import blessed from "blessed";
import type { Screen as TuiScreen } from "./types.ts";

type BlessedScreen = Widgets.Screen;

const screens = new WeakMap<TuiScreen, BlessedScreen>();

export function createScreen(title: string): TuiScreen {
  const bs = blessed.screen({ smartCSR: true, title });
  const handle: TuiScreen = {
    render: () => {
      bs.render();
    },
    destroy: () => {
      bs.destroy();
      screens.delete(handle);
    },
    onKey: (keys, handler) => {
      bs.key(keys, handler);
    },
  };
  screens.set(handle, bs);
  return handle;
}

export function getBlessed(handle: TuiScreen): BlessedScreen {
  const bs = screens.get(handle);
  if (!bs) throw new Error("Screen not found");
  return bs;
}
