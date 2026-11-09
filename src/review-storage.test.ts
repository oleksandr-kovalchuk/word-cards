import { beforeEach, describe, expect, it } from 'vitest';
import { REVIEW_STORAGE_KEY, loadReviewStates, saveReviewStates } from './review-storage';
import { STORAGE_KEY } from './storage';
import { createReviewState, review } from './srs';

const NOW = new Date('2026-11-09T10:00:00.000Z');

describe('review state storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('uses its own key, separate from the words', () => {
    expect(REVIEW_STORAGE_KEY).not.toBe(STORAGE_KEY);
  });

  it('returns an empty list when nothing is saved', () => {
    expect(loadReviewStates()).toEqual([]);
  });

  it('saves and loads states', () => {
    const states = [createReviewState('a', NOW), review(createReviewState('b', NOW), 'know', NOW)];

    saveReviewStates(states);

    expect(loadReviewStates()).toEqual(states);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('returns an empty list for broken JSON', () => {
    localStorage.setItem(REVIEW_STORAGE_KEY, '{not json');
    expect(loadReviewStates()).toEqual([]);
  });

  it('returns an empty list when the stored value is not an array', () => {
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify({ wordId: 'a' }));
    expect(loadReviewStates()).toEqual([]);
  });

  it('skips entries that are not review states', () => {
    const valid = createReviewState('a', NOW);
    localStorage.setItem(
      REVIEW_STORAGE_KEY,
      JSON.stringify([valid, { wordId: 'b' }, { ...valid, dueAt: 'soon' }, null, 7]),
    );

    expect(loadReviewStates()).toEqual([valid]);
  });

  it('works with a storage passed in explicitly', () => {
    sessionStorage.clear();
    const states = [createReviewState('a', NOW)];

    saveReviewStates(states, sessionStorage);

    expect(loadReviewStates(sessionStorage)).toEqual(states);
    expect(loadReviewStates()).toEqual([]);
  });
});
