import { describe, expect, it } from 'vitest';
import { LEARNED_INTERVAL_DAYS, addReviewDay, getStats, getStreak, toDayKey } from './stats';
import type { ReviewState } from './srs';
import type { Word } from './word';

// Local-time dates, so the tests do not depend on the machine's time zone.
const NOW = new Date(2026, 10, 9, 10, 0);

function word(id: string): Word {
  return { id, term: id, translation: id, createdAt: '2026-11-01T00:00:00.000Z' };
}

function state(wordId: string, intervalDays: number, dueAt: Date): ReviewState {
  return { wordId, intervalDays, dueAt: dueAt.toISOString(), lastReviewedAt: NOW.toISOString() };
}

describe('toDayKey', () => {
  it('formats the local date with zero padding', () => {
    expect(toDayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(toDayKey(new Date(2026, 10, 9, 0, 0))).toBe('2026-11-09');
  });
});

describe('addReviewDay', () => {
  it('adds today once', () => {
    const days = addReviewDay([], NOW);
    expect(days).toEqual(['2026-11-09']);
    expect(addReviewDay(days, new Date(2026, 10, 9, 22, 0))).toBe(days);
  });

  it('does not mutate the input', () => {
    const days = ['2026-11-08'];
    addReviewDay(days, NOW);
    expect(days).toEqual(['2026-11-08']);
  });
});

describe('getStreak', () => {
  it('is 0 without reviews', () => {
    expect(getStreak([], NOW)).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    expect(getStreak(['2026-11-07', '2026-11-08', '2026-11-09'], NOW)).toBe(3);
  });

  it('keeps a streak that ended yesterday', () => {
    expect(getStreak(['2026-11-07', '2026-11-08'], NOW)).toBe(2);
  });

  it('is 0 when the last review was two days ago', () => {
    expect(getStreak(['2026-11-06', '2026-11-07'], NOW)).toBe(0);
  });

  it('stops at a gap and ignores order', () => {
    expect(getStreak(['2026-11-09', '2026-11-05', '2026-11-08', '2026-11-06'], NOW)).toBe(2);
  });

  it('crosses month and year boundaries', () => {
    expect(getStreak(['2025-12-31', '2026-01-01'], new Date(2026, 0, 1, 9))).toBe(2);
    expect(getStreak(['2026-10-31', '2026-11-01'], new Date(2026, 10, 1, 9))).toBe(2);
  });
});

describe('getStats', () => {
  it('is all zeros for an empty app', () => {
    expect(getStats([], [], [], NOW)).toEqual({ total: 0, learned: 0, dueToday: 0, streak: 0 });
  });

  it('counts words, learned words, words due today and the streak', () => {
    const words = [word('new'), word('due'), word('later-today'), word('tomorrow'), word('learned')];
    const states = [
      state('due', 1, new Date(2026, 10, 8, 9)),
      state('later-today', 2, new Date(2026, 10, 9, 23, 30)),
      state('tomorrow', 4, new Date(2026, 10, 10, 0, 0)),
      state('learned', LEARNED_INTERVAL_DAYS, new Date(2026, 10, 16, 10)),
    ];

    expect(getStats(words, states, ['2026-11-08', '2026-11-09'], NOW)).toEqual({
      total: 5,
      learned: 1,
      dueToday: 3,
      streak: 2,
    });
  });

  it('does not count an interval just below the threshold as learned', () => {
    const states = [state('a', LEARNED_INTERVAL_DAYS - 1, new Date(2026, 10, 15))];
    expect(getStats([word('a')], states, [], NOW).learned).toBe(0);
  });

  it('ignores states of words that no longer exist', () => {
    const states = [state('gone', 30, new Date(2026, 10, 8))];
    expect(getStats([word('a')], states, [], NOW)).toEqual({ total: 1, learned: 0, dueToday: 1, streak: 0 });
  });
});
