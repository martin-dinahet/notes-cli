import { readFile, writeFile } from "node:fs/promises";

interface NoteMetadata {
  title: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?/;

function parseField(frontmatter: string, key: string): string | undefined {
  const line = frontmatter.split("\n").find((l) => l.startsWith(`${key}:`));
  return line
    ?.slice(key.length + 1)
    .trim()
    .replace(/^"|"$/g, "");
}

function parseTags(frontmatter: string): string[] {
  const value = parseField(frontmatter, "tags");
  if (!value || value === "[]") return [];
  if (!value.startsWith("[") || !value.endsWith("]")) return [];
  return value
    .slice(1, -1)
    .split(",")
    .map((tag) => tag.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
}

function formatMetadata(metadata: NoteMetadata): string {
  const tags = metadata.tags.map((tag) => `"${tag.replace(/"/g, '\\"')}"`).join(", ");
  return [
    "---",
    `title: "${metadata.title.replace(/"/g, '\\"')}"`,
    `createdAt: ${metadata.createdAt}`,
    `updatedAt: ${metadata.updatedAt}`,
    `tags: [${tags}]`,
    "---",
    "",
  ].join("\n");
}

export function createMarkdownNote(title: string, now = new Date()): string {
  const timestamp = now.toISOString();
  return `${formatMetadata({ title, createdAt: timestamp, updatedAt: timestamp, tags: [] })}# ${title}\n\n`;
}

export async function updateMarkdownNoteMetadata(filePath: string, title: string): Promise<void> {
  const now = new Date().toISOString();
  const content = await readFile(filePath, "utf-8");
  const match = content.match(FRONTMATTER_RE);

  if (!match) {
    const body = content.trim().length > 0 ? content : `# ${title}\n\n`;
    await writeFile(
      filePath,
      `${formatMetadata({ title, createdAt: now, updatedAt: now, tags: [] })}${body}`,
      "utf-8",
    );
    return;
  }

  const frontmatter = match[1] ?? "";
  const metadata = formatMetadata({
    title: parseField(frontmatter, "title") ?? title,
    createdAt: parseField(frontmatter, "createdAt") ?? now,
    updatedAt: now,
    tags: parseTags(frontmatter),
  });
  await writeFile(filePath, `${metadata}${content.slice(match[0].length)}`, "utf-8");
}
