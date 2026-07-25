/**
 * Deterministic avatar tint from a seed string (e.g. company code), shared so the
 * same entity gets the same color everywhere it's shown (dashboard, tables, etc.).
 *
 * Uses a proper string hash (djb2) instead of a sum-of-char-codes, since a plain sum
 * is order-independent — "AB" and "BA" (or any two seeds with the same character
 * multiset) would hash identically and collide on the same color.
 */

const AVATAR_TINTS = [
  "bg-brand-navy text-white",
  "bg-sky-200 text-sky-900",
  "bg-green-200 text-green-900",
  "bg-violet-200 text-violet-900",
  "bg-amber-200 text-amber-900",
];

/**
 * djb2 string hash — used instead of a sum-of-char-codes, since a plain sum is
 * order-independent ("AB" and "BA", or any two seeds with the same character
 * multiset, would hash identically and collide on the same color).
 */
export function hashIndex(seed: string, bucketCount: number): number {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 33) ^ seed.charCodeAt(i);
  }
  return Math.abs(hash) % bucketCount;
}

export function avatarTintFor(seed: string): string {
  return AVATAR_TINTS[hashIndex(seed, AVATAR_TINTS.length)];
}
