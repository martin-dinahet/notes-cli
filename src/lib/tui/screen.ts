import { term } from "./term.ts";
import type { Screen as TuiScreen } from "./types.ts";

export { term };

const screens = new WeakMap<TuiScreen, true>();

export function createScreen(_title: string): TuiScreen {
  term.clear();
  term.hideCursor();
  term.grabInput(true);

  const handlers: Array<{ keys: string[]; handler: () => void }> = [];
  let destroyed = false;

  term.on("key", (name: string) => {
    if (destroyed) return;
    for (const { keys, handler } of handlers) {
      if (keys.includes(name)) {
        handler();
      }
    }
  });

  const handle: TuiScreen = {
    render: () => {},
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      term.grabInput(false);
      term.hideCursor(false);
      term.styleReset();
      term.clear();
      screens.delete(handle);
    },
    onKey: (keys, handler) => {
      handlers.push({ keys: keys.map((k) => k.toLowerCase()), handler });
    },
  };

  screens.set(handle, true);
  return handle;
}
