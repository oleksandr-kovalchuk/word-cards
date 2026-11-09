import { describe, expect, it } from 'vitest';
import {
  MAX_INTERVAL_DAYS,
  createReviewState,
  isDue,
  nextIntervalDays,
  review,
  type ReviewState,
} from './srs';

const NOW = new Date('2026-11-09T10:00:00.000Z');

function daysLater(days: number): string {
  return new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

describe('createReviewState', () => {
  it('creates a new state that is due right away', () => {
    const state = createReviewState('word-1', NOW);

    expect(state).toEqual({
      wordId: 'word-1',
      intervalDays: 0,
      dueAt: NOW.toISOString(),
      lastReviewedAt: null,
    });
    expect(isDue(state, NOW)).toBe(true);
  });
});

describe('nextIntervalDays', () => {
  it('starts at 1 day for a new card', () => {
    expect(nextIntervalDays(0, 'know')).toBe(1);
  });

  it('doubles the interval on "know"', () => {
    expect(nextIntervalDays(1, 'know')).toBe(2);
    expect(nextIntervalDays(2, 'know')).toBe(4);
    expect(nextIntervalDays(8, 'know')).toBe(16);
  });

  it('caps the interval', () => {
    expect(nextIntervalDays(300, 'know')).toBe(MAX_INTERVAL_DAYS);
    expect(nextIntervalDays(MAX_INTERVAL_DAYS, 'know')).toBe(MAX_INTERVAL_DAYS);
  });

  it('resets to 0 on "dont-know"', () => {
    expect(nextIntervalDays(0, 'dont-know')).toBe(0);
    expect(nextIntervalDays(16, 'dont-know')).toBe(0);
  });
});

describe('review', () => {
  it('schedules a new card for tomorrow on "know"', () => {
    const state = review(createReviewState('word-1', NOW), 'know', NOW);

    expect(state).toEqual({
      wordId: 'word-1',
      intervalDays: 1,
      dueAt: daysLater(1),
      lastReviewedAt: NOW.toISOString(),
    });
  });

  it('grows the interval over several "know" answers', () => {
    let state = createReviewState('word-1', NOW);
    const intervals: number[] = [];

    for (let i = 0; i < 4; i++) {
      state = review(state, 'know', NOW);
      intervals.push(state.intervalDays);
    }

    expect(intervals).toEqual([1, 2, 4, 8]);
    expect(state.dueAt).toBe(daysLater(8));
  });

  it('makes the card due again right away on "dont-know"', () => {
    const learned: ReviewState = {
      wordId: 'word-1',
      intervalDays: 8,
      dueAt: NOW.toISOString(),
      lastReviewedAt: daysLater(-8),
    };

    const state = review(learned, 'dont-know', NOW);

    expect(state).toEqual({
      wordId: 'word-1',
      intervalDays: 0,
      dueAt: NOW.toISOString(),
      lastReviewedAt: NOW.toISOString(),
    });
    expect(isDue(state, NOW)).toBe(true);
  });

  it('does not mutate the input state', () => {
    const original = createReviewState('word-1', NOW);
    const copy = { ...original };

    review(original, 'know', NOW);

    expect(original).toEqual(copy);
  });
});

describe('isDue', () => {
  const state = review(createReviewState('word-1', NOW), 'know', NOW);

  it('is false before the due date', () => {
    expect(isDue(state, new Date(daysLater(0.5)))).toBe(false);
  });

  it('is true at and after the due date', () => {
    expect(isDue(state, new Date(daysLater(1)))).toBe(true);
    expect(isDue(state, new Date(daysLater(3)))).toBe(true);
  });
});
