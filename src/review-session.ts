/**
 * Pure helpers that connect words with their review progress.
 *
 * A word without a saved `ReviewState` has never been reviewed and counts as due.
 */
import { createReviewState, isDue, review, type ReviewAnswer, type ReviewState } from './srs';
import type { Word } from './word';

/** Returns the saved state for a word, or a fresh one if it was never reviewed. */
export function getReviewState(states: ReviewState[], wordId: string, now: Date = new Date()): ReviewState {
  return states.find((state) => state.wordId === wordId) ?? createReviewState(wordId, now);
}

/**
 * Returns the words that should be reviewed at `now`, the most overdue first.
 * Words that were never reviewed come in the order they were added.
 */
export function getDueWords(words: Word[], states: ReviewState[], now: Date = new Date()): Word[] {
  const byWordId = new Map(states.map((state) => [state.wordId, state]));

  return words
    .map((word, index) => ({ word, index, state: byWordId.get(word.id) }))
    .filter(({ state }) => !state || isDue(state, now))
    .sort((a, b) => {
      const aDue = a.state ? Date.parse(a.state.dueAt) : -Infinity;
      const bDue = b.state ? Date.parse(b.state.dueAt) : -Infinity;
      if (aDue !== bDue) return aDue < bDue ? -1 : 1;
      return a.index - b.index;
    })
    .map(({ word }) => word);
}

/**
 * Applies an answer for one word and returns the updated list of states.
 * Creates the state if the word was never reviewed. Does not mutate the input.
 */
export function applyAnswer(
  states: ReviewState[],
  wordId: string,
  answer: ReviewAnswer,
  now: Date = new Date(),
): ReviewState[] {
  const next = review(getReviewState(states, wordId, now), answer, now);
  const exists = states.some((state) => state.wordId === wordId);

  return exists
    ? states.map((state) => (state.wordId === wordId ? next : state))
    : [...states, next];
}
