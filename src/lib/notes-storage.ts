/**
 * Notes persistence — there is no Notes API in the backend (see API_DOCUMENTATION.md),
 * so notes are stored locally in the browser, namespaced per signed-in user. This is a
 * real, working feature (not mock data) — it just doesn't sync across devices yet.
 */
import type { JSONContent } from "@tiptap/core";

export const EMPTY_CONTENT: JSONContent = {
  type: "doc",
  content: [
    {
      type: "taskList",
      content: [{ type: "taskItem", attrs: { checked: false }, content: [{ type: "paragraph" }] }],
    },
  ],
};

export interface Note {
  id: string;
  title: string;
  tags: string[];
  content: JSONContent;
  bookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

/** True when the doc has no text anywhere (an untouched note, or one emptied back out). */
export function isContentEmpty(content: JSONContent): boolean {
  function hasText(node: JSONContent): boolean {
    if (node.type === "text" && node.text?.trim()) return true;
    return (node.content ?? []).some(hasText);
  }
  return !hasText(content);
}

/** Up to `limit` checklist items for the sidebar preview — plain text + checked state. */
export function extractPreviewItems(content: JSONContent, limit = 3): { text: string; checked: boolean }[] {
  function textOf(node: JSONContent): string {
    if (node.type === "text") return node.text ?? "";
    return (node.content ?? []).map(textOf).join("");
  }
  const items: { text: string; checked: boolean }[] = [];
  function walk(node: JSONContent) {
    if (items.length >= limit) return;
    if (node.type === "taskItem") {
      items.push({ text: textOf(node).trim(), checked: node.attrs?.checked === true });
    }
    (node.content ?? []).forEach(walk);
  }
  walk(content);
  return items;
}

/** Pre-Tiptap notes stored a flat `items` checklist instead of rich `content`. */
interface LegacyChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}
interface StoredNote extends Omit<Note, "content"> {
  content?: JSONContent;
  items?: LegacyChecklistItem[];
}

function legacyItemsToContent(items: LegacyChecklistItem[]): JSONContent {
  if (items.length === 0) return EMPTY_CONTENT;
  return {
    type: "doc",
    content: [
      {
        type: "taskList",
        content: items.map((item) => ({
          type: "taskItem",
          attrs: { checked: item.checked },
          content: [{ type: "paragraph", content: item.text ? [{ type: "text", text: item.text }] : [] }],
        })),
      },
    ],
  };
}

function storageKey(email: string): string {
  return `lms-ai:notes:${email}`;
}

export function loadNotes(email: string): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(email));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredNote[];
    return parsed.map(({ items, content, ...rest }) => ({
      ...rest,
      content: content ?? legacyItemsToContent(items ?? []),
    }));
  } catch {
    return [];
  }
}

/** Returns false on failure (e.g. quota exceeded — attachments push notes toward localStorage's size limit). */
export function persistNotes(email: string, notes: Note[]): boolean {
  if (typeof window === "undefined") return true;
  try {
    localStorage.setItem(storageKey(email), JSON.stringify(notes));
    return true;
  } catch {
    return false;
  }
}
