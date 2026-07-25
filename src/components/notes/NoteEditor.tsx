"use client";

/** Right pane: editable title, tags, bookmark/delete actions, and a real Tiptap checklist editor. */
import { useEffect, useState } from "react";
import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, FontFamily, FontSize } from "@tiptap/extension-text-style";
import { Placeholder } from "@tiptap/extensions";
import { Bookmark, MoreHorizontal, NotebookText, Plus, X } from "lucide-react";
import { isContentEmpty, type Note } from "@/lib/notes-storage";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TagBadge } from "./TagBadge";
import { NoteToolbar } from "./NoteToolbar";
import { TaskItemStrike } from "./task-item-strike";

interface NoteEditorProps {
  note: Note | undefined;
  /** Total note count, so delete-disabling only applies to the sole leftover note (see `isUnchanged`). */
  notesCount: number;
  onUpdate: (patch: Partial<Pick<Note, "title" | "tags" | "bookmarked" | "content">>) => void;
  onDelete: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NoteEditor({ note, notesCount, onUpdate, onDelete }: NoteEditorProps) {
  const [newTag, setNewTag] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ["paragraph"] }),
      TextStyle,
      FontFamily,
      FontSize,
      Placeholder.configure({
        placeholder: ({ node }) => (node.type.name === "taskItem" ? "Add an item…" : ""),
      }),
      TaskItemStrike,
    ],
    content: note?.content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-content min-h-24 outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      if (note) onUpdate({ content: editor.getJSON() });
    },
  });

  const noteId = note?.id;
  useEffect(() => {
    if (!editor || !note) return;
    editor.commands.setContent(note.content, { emitUpdate: false });
    // Only resync when switching to a different note — not on every keystroke's onUpdate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, noteId]);

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      bold: ctx.editor?.isActive("bold") ?? false,
      italic: ctx.editor?.isActive("italic") ?? false,
      underline: ctx.editor?.isActive("underline") ?? false,
      taskList: ctx.editor?.isActive("taskList") ?? false,
      align: (ctx.editor?.getAttributes("paragraph").textAlign as string | undefined) ?? "left",
      fontFamily: (ctx.editor?.getAttributes("textStyle").fontFamily as string | undefined) ?? "",
      fontSize: (ctx.editor?.getAttributes("textStyle").fontSize as string | undefined) ?? "",
      canSink: ctx.editor?.can().sinkListItem("taskItem") ?? false,
      canLift: ctx.editor?.can().liftListItem("taskItem") ?? false,
    }),
  });

  if (!note) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <EmptyState icon={NotebookText} title="No note selected" description="Pick a note from the list, or add a new one." />
      </div>
    );
  }

  function submitNewTag() {
    const tag = newTag.trim();
    if (tag && !note!.tags.includes(tag)) {
      onUpdate({ tags: [...note!.tags, tag] });
    }
    setNewTag("");
    setAddingTag(false);
  }

  function removeTag(tag: string) {
    onUpdate({ tags: note!.tags.filter((t) => t !== tag) });
  }

  // Disabling delete only matters for the sole leftover note (the one the page
  // auto-creates so the empty state never shows) — with more than one note,
  // deleting is always safe regardless of whether this one was edited.
  const isUnchanged =
    notesCount === 1 &&
    note.title === "Untitled note" &&
    note.tags.length === 0 &&
    !note.bookmarked &&
    isContentEmpty(note.content);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Input
            value={note.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="h-auto border-none bg-transparent px-0 text-xl font-bold shadow-none focus-visible:ring-0"
            aria-label="Note title"
          />
          <p className="mt-1 text-xs text-muted-foreground">{formatDate(note.createdAt)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => onUpdate({ bookmarked: !note.bookmarked })}
            aria-label={note.bookmarked ? "Remove bookmark" : "Bookmark note"}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full border text-muted-foreground hover:bg-muted"
          >
            <Bookmark className={note.bookmarked ? "size-4 fill-current text-primary" : "size-4"} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="More note actions"
              className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted"
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={isUnchanged}
                className="text-destructive"
              >
                Delete note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {note.tags.map((tag) => (
          <span key={tag} className="group relative">
            <TagBadge tag={tag} />
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove tag ${tag}`}
              className="absolute -top-1.5 -right-1.5 hidden size-3.5 cursor-pointer items-center justify-center rounded-full bg-foreground text-background group-hover:flex"
            >
              <X className="size-2.5" />
            </button>
          </span>
        ))}
        {addingTag ? (
          <Input
            autoFocus
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onBlur={submitNewTag}
            onKeyDown={(e) => e.key === "Enter" && submitNewTag()}
            placeholder="Tag name…"
            className="h-6 w-24 px-2 text-xs"
          />
        ) : (
          <button
            type="button"
            onClick={() => setAddingTag(true)}
            className="inline-flex cursor-pointer items-center gap-0.5 rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted"
          >
            <Plus className="size-3" />
            Tag
          </button>
        )}
      </div>

      <NoteToolbar editor={editor} state={editorState} />

      <div className="mt-4 flex-1">
        <EditorContent editor={editor} />
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete note?"
        description="This will permanently delete this note and its checklist items. This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          setConfirmDeleteOpen(false);
          onDelete();
        }}
      />
    </div>
  );
}
