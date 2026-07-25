"use client";

/**
 * Route: `/notes` — personal checklists. No backend Notes API exists yet, so notes are
 * stored locally per signed-in user (see lib/notes-storage.ts) — a real, working feature,
 * just not synced across devices.
 */
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNotes } from "@/hooks/use-notes";
import { PageHeader } from "@/components/common/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FullPageLoader from "@/components/FullPageLoader";
import { NoteListItem } from "@/components/notes/NoteListItem";
import { NoteEditor } from "@/components/notes/NoteEditor";

type SortKey = "newest" | "oldest" | "title";
type BookmarkFilter = "all" | "bookmarked";

export default function NotesPage() {
  const auth = useAuth();
  if (auth.status !== "authed") return <FullPageLoader />;
  return <NotesContent email={auth.profile.email} />;
}

function NotesContent({ email }: { email: string }) {
  const { notes, loaded, addNote, updateNote, deleteNote } = useNotes(email);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("newest");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [bookmarkFilter, setBookmarkFilter] = useState<BookmarkFilter>("all");
  const [focusMode, setFocusMode] = useState(false);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [notes]);

  const visibleNotes = useMemo(() => {
    let filtered = tagFilter === "all" ? notes : notes.filter((n) => n.tags.includes(tagFilter));
    if (bookmarkFilter === "bookmarked") filtered = filtered.filter((n) => n.bookmarked);
    return [...filtered].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [notes, sort, tagFilter, bookmarkFilter]);

  useEffect(() => {
    if (!loaded) return;
    if (notes.length === 0) {
      setSelectedId(addNote().id);
      return;
    }
    if (selectedId && notes.some((n) => n.id === selectedId)) return;
    setSelectedId(visibleNotes[0]?.id ?? null);
    // Only re-run when the note set or loaded state changes — not on every sort/filter tweak.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, notes]);

  const selectedNote = notes.find((n) => n.id === selectedId);

  function handleAddNote() {
    const note = addNote();
    setSelectedId(note.id);
  }

  if (!loaded) return <FullPageLoader />;

  return (
    <div className="flex h-full flex-col gap-6">
      <PageHeader
        title="Notes"
        description="Personal checklists — stored on this device."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Sort</span>
              <Select value={sort} onValueChange={(v) => v && setSort(v as SortKey)}>
                <SelectTrigger size="sm" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="title">Title (A–Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Tag</span>
              <Select value={tagFilter} onValueChange={(v) => setTagFilter(v ?? "all")}>
                <SelectTrigger size="sm" className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tags</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Bookmarked</span>
              <Select
                value={bookmarkFilter}
                onValueChange={(v) => setBookmarkFilter((v as BookmarkFilter) ?? "all")}
              >
                <SelectTrigger size="sm" className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All notes</SelectItem>
                  <SelectItem value="bookmarked">Bookmarked only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        }
      />

      <div className="flex min-h-0 flex-1 gap-4 rounded-2xl border bg-muted/30">
        {!focusMode && (
          <div className="flex w-72 shrink-0 flex-col gap-2 overflow-y-auto border-r p-3">
            <div className="flex items-center justify-between px-1 py-1">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">My notes</span>
              <button
                type="button"
                onClick={handleAddNote}
                aria-label="Add note"
                className="inline-flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-card hover:text-foreground"
              >
                <Plus className="size-4" />
              </button>
            </div>
            {visibleNotes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                active={note.id === selectedId}
                onSelect={() => setSelectedId(note.id)}
              />
            ))}
          </div>
        )}

        <NoteEditor
          note={selectedNote}
          notesCount={notes.length}
          isFullScreen={focusMode}
          onToggleFullScreen={() => setFocusMode((v) => !v)}
          onUpdate={(patch) => selectedNote && updateNote(selectedNote.id, patch)}
          onDelete={() => {
            if (!selectedNote) return;
            deleteNote(selectedNote.id);
            setSelectedId(null);
            setFocusMode(false);
          }}
        />
      </div>
    </div>
  );
}
