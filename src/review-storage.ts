import type { ReviewState } from './srs';

/** localStorage key that holds review progress, separate from the words. */
export const REVIEW_STORAGE_KEY = 'word-cards:reviews';

function isReviewState(value: unknown): value is ReviewState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.wordId === 'string' &&
    typeof v.intervalDays === 'number' &&
    Number.isFinite(v.intervalDays) &&
    typeof v.dueAt === 'string' &&
    !Number.isNaN(Date.parse(v.dueAt)) &&
    (v.lastReviewedAt === null || typeof v.lastReviewedAt === 'string')
  );
}

/**
 * Reads saved review states. Returns an empty list when nothing is saved or
 * the data is broken, and skips entries that do not look like a ReviewState.
 */
export function loadReviewStates(storage: Storage = localStorage): ReviewState[] {
  const raw = storage.getItem(REVIEW_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isReviewState) : [];
  } catch {
    return [];
  }
}

/** Saves all review states, replacing what was stored before. */
export function saveReviewStates(states: ReviewState[], storage: Storage = localStorage): void {
  storage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(states));
}
