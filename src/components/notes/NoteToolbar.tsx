"use client";

/** Rich-text toolbar wired to the note's live Tiptap editor instance. */
import { Bold, Indent, Italic, ListChecks, Outdent, Paperclip, Underline, type LucideIcon } from "lucide-react";
import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconTooltip } from "@/components/common/IconTooltip";

const FONT_FAMILIES = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Mono", value: "'JetBrains Mono', monospace" },
];

const FONT_SIZES = ["14px", "16px", "18px", "20px", "24px", "32px"];

const ALIGNMENTS = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
  { label: "Justify", value: "justify" },
];

export interface NoteToolbarState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  taskList: boolean;
  align: string;
  fontFamily: string;
  fontSize: string;
  canSink: boolean;
  canLift: boolean;
}

interface NoteToolbarProps {
  editor: Editor | null;
  state: NoteToolbarState | null;
  onAttachFile: () => void;
}

function ToolbarButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
  className,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <IconTooltip label={label}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground",
          disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-muted",
          active && "bg-muted text-foreground",
          className,
        )}
      >
        <Icon className="size-4" />
      </button>
    </IconTooltip>
  );
}

export function NoteToolbar({ editor, state, onAttachFile }: NoteToolbarProps) {
  if (!editor || !state) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 border-b py-2">
      <Select
        value={state.fontFamily || FONT_FAMILIES[0].value}
        onValueChange={(v) => v && editor.chain().focus().setFontFamily(v).run()}
      >
        <SelectTrigger size="sm" className="h-7 w-24 border-none shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_FAMILIES.map((f) => (
            <SelectItem key={f.value} value={f.value}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={state.fontSize || "16px"}
        onValueChange={(v) => v && editor.chain().focus().setFontSize(v).run()}
      >
        <SelectTrigger size="sm" className="h-7 w-16 border-none shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_SIZES.map((size) => (
            <SelectItem key={size} value={size}>
              {size.replace("px", "")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton
        icon={Bold}
        label="Bold"
        active={state.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        icon={Italic}
        label="Italic"
        active={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        icon={Underline}
        label="Underline"
        active={state.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />

      <div className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton
        icon={Outdent}
        label="Decrease indent"
        disabled={!state.canLift}
        onClick={() => editor.chain().focus().liftListItem("taskItem").run()}
      />
      <ToolbarButton
        icon={Indent}
        label="Increase indent"
        disabled={!state.canSink}
        onClick={() => editor.chain().focus().sinkListItem("taskItem").run()}
      />

      <Select value={state.align} onValueChange={(v) => v && editor.chain().focus().setTextAlign(v).run()}>
        <SelectTrigger size="sm" className="h-7 w-24 border-none shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ALIGNMENTS.map((a) => (
            <SelectItem key={a.value} value={a.value}>
              {a.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ToolbarButton
        icon={Paperclip}
        label="Attach file"
        onClick={onAttachFile}
        className="ml-auto"
      />
      <ToolbarButton
        icon={ListChecks}
        label="Checklist"
        active={state.taskList}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      />
    </div>
  );
}
