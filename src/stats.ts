/**
 * Pure helpers for the Stats tab.
 *
 * Days are local calendar days written as `YYYY-MM-DD` ("day keys"), so a
 * streak follows the user's own midnight, not UTC.
 */
import { isDue, type ReviewState } from './srs';
import type { Word } from './word';

/** A card counts as learned once its interval reaches this many days. */
export const LEARNED_INTERVAL_DAYS = 7;

export interface Stats {
  /** All words the user has added. */
  total: number;
  /** Words whose interval is at least `LEARNED_INTERVAL_DAYS`. */
  learned: number;
  /** Words due for review before the end of today, including new words. */
  dueToday: number;
  /** Consecutive days with at least one review, ending today or yesterday. */
  streak: number;
}

/** Returns the local day key (`YYYY-MM-DD`) of a date. */
export function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Returns the start of the local day before `date`. */
function previousDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
}

/** Returns the first moment of the local day after `now`. */
function startOfTomorrow(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
}

/** Adds the day of `now` to the list of review days. Does not mutate the input. */
export function addReviewDay(days: string[], now: Date = new Date()): string[] {
  const key = toDayKey(now);
  return days.includes(key) ? days : [...days, key];
}

/**
 * Counts consecutive review days ending today. If there was no review today
 * yet, a streak that ended yesterday still counts, so it is not lost before
 * the user had a chance to review.
 */
export function getStreak(days: string[], now: Date = new Date()): number {
  const set = new Set(days);
  let day = set.has(toDayKey(now)) ? now : previousDay(now);
  let streak = 0;

  while (set.has(toDayKey(day))) {
    streak += 1;
    day = previousDay(day);
  }
  return streak;
}

/** Computes all numbers shown on the Stats tab. States of deleted words are ignored. */
export function getStats(
  words: Word[],
  states: ReviewState[],
  reviewDays: string[],
  now: Date = new Date(),
): Stats {
  const byWordId = new Map(states.map((state) => [state.wordId, state]));
  const endOfToday = new Date(startOfTomorrow(now).getTime() - 1);
  let learned = 0;
  let dueToday = 0;

  for (const word of words) {
    const state = byWordId.get(word.id);
    if (state && state.intervalDays >= LEARNED_INTERVAL_DAYS) learned += 1;
    if (!state || isDue(state, endOfToday)) dueToday += 1;
  }

  return { total: words.length, learned, dueToday, streak: getStreak(reviewDays, now) };
}
