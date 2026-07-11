import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** First word of a full name (falls back to the whole string). */
export function firstName(name: string): string {
  return name?.trim().split(/\s+/)[0] || name;
}

/** Uppercase initials from a name, max two characters — for avatar fallbacks. */
export function initials(name: string): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

/** Human-readable role label. */
export function roleLabel(role: string): string {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
