import { describe, expect, it } from 'vitest';
import { applyAnswer, getDueWords, getReviewState } from './review-session';
import { createReviewState, review, type ReviewState } from './srs';
import type { Word } from './word';

const NOW = new Date('2026-11-09T10:00:00.000Z');
const DAY_MS = 24 * 60 * 60 * 1000;

function word(id: string): Word {
  return { id, term: id, translation: id, createdAt: '2026-11-01T00:00:00.000Z' };
}

function stateDueIn(wordId: string, days: number): ReviewState {
  return {
    wordId,
    intervalDays: 1,
    dueAt: new Date(NOW.getTime() + days * DAY_MS).toISOString(),
    lastReviewedAt: new Date(NOW.getTime() - DAY_MS).toISOString(),
  };
}

describe('getReviewState', () => {
  it('returns the saved state for the word', () => {
    const saved = stateDueIn('a', 2);
    expect(getReviewState([saved], 'a', NOW)).toBe(saved);
  });

  it('returns a fresh state for a word never reviewed', () => {
    expect(getReviewState([], 'a', NOW)).toEqual(createReviewState('a', NOW));
  });
});

describe('getDueWords', () => {
  it('treats words without a state as due, in the order they were added', () => {
    expect(getDueWords([word('a'), word('b')], [], NOW).map((w) => w.id)).toEqual(['a', 'b']);
  });

  it('leaves out words that are not due yet', () => {
    const words = [word('a'), word('b')];
    const states = [stateDueIn('a', 1), stateDueIn('b', -1)];

    expect(getDueWords(words, states, NOW).map((w) => w.id)).toEqual(['b']);
  });

  it('includes a card due exactly now', () => {
    expect(getDueWords([word('a')], [stateDueIn('a', 0)], NOW)).toHaveLength(1);
  });

  it('puts new words first, then the most overdue', () => {
    const words = [word('a'), word('b'), word('c')];
    const states = [stateDueIn('a', -1), stateDueIn('b', -3)];

    expect(getDueWords(words, states, NOW).map((w) => w.id)).toEqual(['c', 'b', 'a']);
  });

  it('ignores states of words that no longer exist', () => {
    expect(getDueWords([word('a')], [stateDueIn('gone', -1)], NOW).map((w) => w.id)).toEqual(['a']);
  });

  it('returns an empty list when there are no words', () => {
    expect(getDueWords([], [], NOW)).toEqual([]);
  });
});

describe('applyAnswer', () => {
  it('creates a state for a word never reviewed', () => {
    const result = applyAnswer([], 'a', 'know', NOW);

    expect(result).toEqual([review(createReviewState('a', NOW), 'know', NOW)]);
  });

  it('updates the existing state and keeps the others', () => {
    const a = stateDueIn('a', 0);
    const b = stateDueIn('b', 5);

    const result = applyAnswer([a, b], 'a', 'know', NOW);

    expect(result).toEqual([review(a, 'know', NOW), b]);
  });

  it('does not mutate the input list', () => {
    const states = [stateDueIn('a', 0)];
    const copy = structuredClone(states);

    applyAnswer(states, 'a', 'dont-know', NOW);
    applyAnswer(states, 'b', 'know', NOW);

    expect(states).toEqual(copy);
  });
});
