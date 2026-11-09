/**
 * Spaced-repetition scheduling.
 *
 * Review progress is stored separately from `Word` and linked to it by `wordId`,
 * so the word model stays unchanged. All functions here are pure.
 */

/** The user's answer when reviewing a card. */
export type ReviewAnswer = 'know' | 'dont-know';

/** Review progress of a single word. */
export interface ReviewState {
  /** Id of the `Word` this state belongs to. */
  wordId: string;
  /** Current interval in days. 0 means the card is still being learned. */
  intervalDays: number;
  /** ISO 8601 timestamp of when the card should be shown next. */
  dueAt: string;
  /** ISO 8601 timestamp of the last review, or null if never reviewed. */
  lastReviewedAt: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Longest interval between reviews, in days. */
export const MAX_INTERVAL_DAYS = 365;

/** Creates the state for a word that has never been reviewed. It is due right away. */
export function createReviewState(wordId: string, now: Date = new Date()): ReviewState {
  return {
    wordId,
    intervalDays: 0,
    dueAt: now.toISOString(),
    lastReviewedAt: null,
  };
}

/** Returns the next interval in days for the given answer. */
export function nextIntervalDays(currentDays: number, answer: ReviewAnswer): number {
  if (answer === 'dont-know') {
    return 0;
  }
  if (currentDays < 1) {
    return 1;
  }
  return Math.min(currentDays * 2, MAX_INTERVAL_DAYS);
}

/**
 * Applies an answer to a review state and returns the new state.
 *
 * - "know": the interval goes 1, 2, 4, 8 ... days, capped at `MAX_INTERVAL_DAYS`.
 * - "dont-know": the interval resets to 0 and the card is due again right away.
 */
export function review(state: ReviewState, answer: ReviewAnswer, now: Date = new Date()): ReviewState {
  const intervalDays = nextIntervalDays(state.intervalDays, answer);

  return {
    wordId: state.wordId,
    intervalDays,
    dueAt: new Date(now.getTime() + intervalDays * DAY_MS).toISOString(),
    lastReviewedAt: now.toISOString(),
  };
}

/** Returns true if the card should be shown at `now`. */
export function isDue(state: ReviewState, now: Date = new Date()): boolean {
  return new Date(state.dueAt).getTime() <= now.getTime();
}
