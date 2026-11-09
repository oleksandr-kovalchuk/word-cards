import { addReviewDay } from './stats';

/** localStorage key that holds the days with at least one review (`YYYY-MM-DD`). */
export const REVIEW_DAYS_STORAGE_KEY = 'word-cards:review-days';

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Reads saved review days. Returns an empty list when nothing is saved or the
 * data is broken, and skips entries that are not day keys.
 */
export function loadReviewDays(storage: Storage = localStorage): string[] {
  const raw = storage.getItem(REVIEW_DAYS_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((day): day is string => typeof day === 'string' && DAY_KEY.test(day))
      : [];
  } catch {
    return [];
  }
}

/** Saves all review days, replacing what was stored before. */
export function saveReviewDays(days: string[], storage: Storage = localStorage): void {
  storage.setItem(REVIEW_DAYS_STORAGE_KEY, JSON.stringify(days));
}

/** Records that the user reviewed a card on the day of `now`. */
export function recordReviewDay(now: Date = new Date(), storage: Storage = localStorage): void {
  const days = loadReviewDays(storage);
  const next = addReviewDay(days, now);
  if (next !== days) saveReviewDays(next, storage);
}
