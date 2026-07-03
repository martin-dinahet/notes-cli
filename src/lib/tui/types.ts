export interface Screen {
  render(): void;
  destroy(): void;
  onKey(keys: string[], handler: () => void): void;
}

export interface List {
  setItems(items: string[]): void;
  select(index: number): void;
  getSelected(): number;
  focus(): void;
}

export interface StatusBar {
  setContent(text: string): void;
}
