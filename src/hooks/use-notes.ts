"use client";

/** Local-only notes CRUD (see lib/notes-storage.ts). Persists on every change, scoped to the signed-in user. */
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { EMPTY_CONTENT, loadNotes, persistNotes, type Note } from "@/lib/notes-storage";

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function useNotes(email: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setNotes(loadNotes(email));
    setLoaded(true);
  }, [email]);

  const wasFailing = useRef(false);
  useEffect(() => {
    if (!loaded) return;
    const ok = persistNotes(email, notes);
    if (!ok && !wasFailing.current) {
      toast.error("Couldn't save — local storage is full. Try removing a large attachment or an old note.");
    }
    wasFailing.current = !ok;
  }, [notes, email, loaded]);

  function addNote(): Note {
    const now = new Date().toISOString();
    const note: Note = {
      id: makeId(),
      title: "Untitled note",
      tags: [],
      content: EMPTY_CONTENT,
      bookmarked: false,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [note, ...prev]);
    return note;
  }

  function updateNote(id: string, patch: Partial<Pick<Note, "title" | "tags" | "bookmarked" | "content">>) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n)),
    );
  }

  function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return { notes, loaded, addNote, updateNote, deleteNote };
}
