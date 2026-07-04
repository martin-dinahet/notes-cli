import { term } from "./screen.ts";
import type { StatusBar, Screen as TuiScreen } from "./types.ts";

export function createStatusBar(_screen: TuiScreen): StatusBar {
  return {
    setContent: (text) => {
      term.moveTo(1, term.height);
      term.eraseLine();
      term(` ${text} `);
    },
  };
}
