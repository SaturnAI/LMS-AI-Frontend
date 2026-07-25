"use client";

/** Right pane: editable title, tags, bookmark/delete actions, and a real Tiptap checklist editor. */
import { useEffect, useRef, useState } from "react";
import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, FontFamily, FontSize } from "@tiptap/extension-text-style";
import { Placeholder } from "@tiptap/extensions";
import Image from "@tiptap/extension-image";
import type { EditorView } from "@tiptap/pm/view";
import { toast } from "sonner";
import {
  Bookmark,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  NotebookText,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { isContentEmpty, type Note } from "@/lib/notes-storage";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TagBadge } from "./TagBadge";
import { NoteToolbar } from "./NoteToolbar";
import { TaskItemStrike } from "./task-item-strike";
import { FileAttachment } from "./file-attachment-extension";

const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024; // 2MB — everything rides in localStorage as base64, no backend yet.
const ATTACHMENT_TYPES = new Set(["image", "fileAttachment"]);

/** Deletes the image/fileAttachment atom node whose rendered DOM root is `dom`. */
function deleteAttachmentAt(view: EditorView, dom: HTMLElement): boolean {
  let pos = view.posAtDOM(dom, 0);
  let node = view.state.doc.nodeAt(pos);
  if (!node || !ATTACHMENT_TYPES.has(node.type.name)) {
    pos -= 1;
    node = view.state.doc.nodeAt(pos);
  }
  if (!node || !ATTACHMENT_TYPES.has(node.type.name)) return false;
  view.dispatch(view.state.tr.delete(pos, pos + node.nodeSize));
  return true;
}

interface NoteEditorProps {
  note: Note | undefined;
  /** Total note count, so delete-disabling only applies to the sole leftover note (see `isUnchanged`). */
  notesCount: number;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
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

export function NoteEditor({
  note,
  notesCount,
  isFullScreen,
  onToggleFullScreen,
  onUpdate,
  onDelete,
}: NoteEditorProps) {
  const [newTag, setNewTag] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      Image.configure({
        allowBase64: true,
        resize: { enabled: true, directions: ["right", "bottom", "bottom-right"], minWidth: 80, minHeight: 80 },
      }),
      FileAttachment,
    ],
    content: note?.content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-content min-h-24 outline-none",
      },
      handleDOMEvents: {
        mousedown: (view, event) => {
          const target = event.target as HTMLElement;

          // Our own file/video/pdf card renders a real remove button.
          const removeButton = target.closest("[data-remove-attachment]") as HTMLElement | null;
          if (removeButton) {
            const card = removeButton.closest("[data-file-attachment]") as HTMLElement | null;
            if (card && deleteAttachmentAt(view, card)) event.preventDefault();
            return true;
          }

          // Images: @tiptap/extension-image's resize NodeView owns its own markup,
          // so the "×" is a CSS-only overlay (see globals.css) — hit-test the click
          // against that corner instead of relying on a real button element.
          const imageContainer = target.closest('[data-resize-container][data-node="image"]') as HTMLElement | null;
          if (imageContainer) {
            const rect = imageContainer.getBoundingClientRect();
            const inCorner =
              event.clientX >= rect.right - 28 &&
              event.clientX <= rect.right &&
              event.clientY >= rect.top &&
              event.clientY <= rect.top + 28;
            if (inCorner) {
              if (deleteAttachmentAt(view, imageContainer)) event.preventDefault();
              return true;
            }
          }

          return false;
        },
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;

    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error(`"${file.name}" is too large — attachments are limited to 2 MB (stored locally, no server yet).`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (file.type.startsWith("image/")) {
        editor.chain().focus().setImage({ src: dataUrl, alt: file.name }).run();
      } else {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "fileAttachment",
            attrs: { href: dataUrl, filename: file.name, mimeType: file.type, size: file.size },
          })
          .run();
      }
    };
    reader.onerror = () => toast.error(`Couldn't read "${file.name}".`);
    reader.readAsDataURL(file);
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
              <DropdownMenuItem onClick={onToggleFullScreen}>
                {isFullScreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                {isFullScreen ? "Exit full screen" : "Full-screen edit"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={isUnchanged}
                className="text-destructive"
              >
                <Trash2 className="size-4" />
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

      <NoteToolbar editor={editor} state={editorState} onAttachFile={() => fileInputRef.current?.click()} />
      <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />

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
