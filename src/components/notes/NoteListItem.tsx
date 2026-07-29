/** One note preview card in the notes list pane. */
import { Circle } from "lucide-react";
import { extractPreviewItems, type Note } from "@/lib/notes-storage";
import { cn } from "@/lib/utils";
import { TruncatedText } from "@/components/common/TruncatedText";
import { TagBadge } from "./TagBadge";

interface NoteListItemProps {
  note: Note;
  active: boolean;
  onSelect: () => void;
}

export function NoteListItem({ note, active, onSelect }: NoteListItemProps) {
  const preview = extractPreviewItems(note.content);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full cursor-pointer flex-col gap-2 rounded-xl p-3 text-left transition-colors",
        active ? "bg-card shadow-sm ring-1 ring-border" : "hover:bg-card/60",
      )}
    >
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
      <TruncatedText text={note.title} className="font-semibold text-foreground" />
      {preview.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {preview.map((item, i) => (
            <li key={i} className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
              <Circle className="size-3.5 shrink-0" />
              <TruncatedText text={item.text} className={cn(item.checked && "line-through")} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No items yet.</p>
      )}
    </button>
  );
}
