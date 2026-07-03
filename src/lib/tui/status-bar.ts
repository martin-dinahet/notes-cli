import blessed from "blessed";
import { getBlessed } from "./screen.ts";
import type { Screen, StatusBar } from "./types.ts";

export function createStatusBar(screen: Screen): StatusBar {
  const bs = getBlessed(screen);
  const box = blessed.box({
    parent: bs,
    bottom: 0,
    left: 2,
    width: "100%",
    height: 1,
    tags: true,
    content: "",
  });

  return {
    setContent: (text) => {
      box.setContent(text);
    },
  };
}
