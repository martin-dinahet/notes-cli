export interface Config {
  notesDir: string;
  editor: string;
  viewer: "editor" | "glow";
}

export interface Note {
  title: string;
  path: string;
}

export interface ContentMatch {
  note: Note;
  lines: { number: number; text: string }[];
}

export interface CreateNoteResult {
  status: "created" | "exists";
  path: string;
}
