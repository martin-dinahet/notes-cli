type KeyHandler = (name: string) => void;

const keyHandlers = new Set<KeyHandler>();
let listening = false;

function out(s: string): void {
  Bun.stdout.write(s);
}

interface Term {
  (text: string): void;
  clear(): void;
  hideCursor(hide?: boolean): void;
  grabInput(grab: boolean): void;
  styleReset(): void;
  readonly height: number;
  moveTo(col: number, row: number): void;
  eraseLine(): void;
  bgWhite: { black(text: string): void };
  on(event: string, handler: KeyHandler): void;
}

function _term(text: string): void {
  out(text);
}

_term.clear = function clear(): void {
  out("\x1b[2J\x1b[H");
};

_term.hideCursor = function hideCursor(hide?: boolean): void {
  out(`\x1b[?25${hide === false ? "h" : "l"}`);
};

_term.grabInput = function grabInput(grab: boolean): void {
  if (grab) {
    if (!listening) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on("data", onData);
      listening = true;
    }
  } else {
    if (listening) {
      process.stdin.off("data", onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      listening = false;
    }
  }
};

_term.styleReset = function styleReset(): void {
  out("\x1b[0m");
};

Object.defineProperty(_term, "height", {
  get: () => process.stdout.rows ?? 24,
  enumerable: true,
});

_term.moveTo = function moveTo(col: number, row: number): void {
  out(`\x1b[${row};${col}H`);
};

_term.eraseLine = function eraseLine(): void {
  out("\x1b[2K");
};

_term.bgWhite = {
  black(text: string): void {
    out(`\x1b[47;30m${text}\x1b[0m`);
  },
};

_term.on = function on(event: string, handler: KeyHandler): void {
  if (event === "key") keyHandlers.add(handler);
};

export const term = _term as unknown as Term;

function onData(data: Buffer): void {
  const keys = parseKeys(data);
  for (const key of keys) {
    for (const handler of keyHandlers) {
      handler(key);
    }
  }
}

const keyMap: Record<string, string> = {
  SPACE: "space",
  ESCAPE: "escape",
  CTRL_C: "C-c",
};

function parseKeys(buf: Buffer): string[] {
  const result: string[] = [];
  let i = 0;
  while (i < buf.length) {
    const b = buf[i];
    if (b === undefined) break;
    if (b === 0x1b) {
      if (i + 2 < buf.length && buf[i + 1] === 0x5b) {
        const c = buf[i + 2];
        if (c === undefined) break;
        if (c === 0x41) {
          result.push("UP");
          i += 3;
          continue;
        }
        if (c === 0x42) {
          result.push("DOWN");
          i += 3;
          continue;
        }
        if (c === 0x43) {
          result.push("RIGHT");
          i += 3;
          continue;
        }
        if (c === 0x44) {
          result.push("LEFT");
          i += 3;
          continue;
        }
      }
      result.push("ESCAPE");
      i += 1;
    } else if (b === 0x03) {
      result.push("CTRL_C");
      i += 1;
    } else if (b === 0x20) {
      result.push("SPACE");
      i += 1;
    } else if (b >= 0x20 && b <= 0x7e) {
      result.push(String.fromCharCode(b));
      i += 1;
    } else {
      i += 1;
    }
  }
  return result.map((k) => keyMap[k] ?? k);
}
