import { beforeEach, describe, expect, it } from 'vitest';
import { startReviewMode } from './review-mode';
import { loadReviewStates, saveReviewStates } from './review-storage';
import { createReviewState, review, type ReviewAnswer } from './srs';
import type { Word } from './word';

const NOW = new Date('2026-11-09T10:00:00.000Z');
const now = () => NOW;

function word(id: string): Word {
  return { id, term: `term-${id}`, translation: `tr-${id}`, createdAt: '2026-11-01T00:00:00.000Z' };
}

function currentTerm(container: HTMLElement): string | null {
  return container.querySelector('.review-term')?.textContent ?? null;
}

function answer(container: HTMLElement, value: ReviewAnswer): void {
  container.querySelector<HTMLButtonElement>('.review-reveal')!.click();
  container.querySelector<HTMLButtonElement>(`[data-answer="${value}"]`)!.click();
}

function status(container: HTMLElement): string {
  return container.querySelector('.review-status')!.textContent ?? '';
}

describe('startReviewMode', () => {
  let container: HTMLElement;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.append(container);
  });

  it('asks to add words when there are none', () => {
    startReviewMode(container, { words: [], now });

    expect(status(container)).toBe('Add some words first.');
    expect(currentTerm(container)).toBeNull();
  });

  it('says there is nothing to review when no card is due', () => {
    saveReviewStates([review(createReviewState('a', NOW), 'know', NOW)]);

    startReviewMode(container, { words: [word('a')], now });

    expect(status(container)).toBe('No cards to review right now.');
    expect(currentTerm(container)).toBeNull();
  });

  it('shows due cards one by one and saves each answer', () => {
    const mode = startReviewMode(container, { words: [word('a'), word('b')], now });

    expect(currentTerm(container)).toBe('term-a');
    expect(status(container)).toBe('Cards left: 2');

    answer(container, 'know');

    expect(loadReviewStates()).toEqual([review(createReviewState('a', NOW), 'know', NOW)]);
    expect(currentTerm(container)).toBe('term-b');
    expect(mode.remaining()).toBe(1);

    answer(container, 'know');

    expect(loadReviewStates().map((s) => s.wordId)).toEqual(['a', 'b']);
    expect(currentTerm(container)).toBeNull();
    expect(container.querySelectorAll('.review-card')).toHaveLength(0);
    expect(status(container)).toBe('All done for now. Come back later for more cards.');
  });

  it('brings a "dont-know" card back at the end of the session', () => {
    const mode = startReviewMode(container, { words: [word('a'), word('b')], now });

    answer(container, 'dont-know');
    expect(currentTerm(container)).toBe('term-b');
    expect(mode.remaining()).toBe(2);

    answer(container, 'know');
    expect(currentTerm(container)).toBe('term-a');

    answer(container, 'know');
    expect(mode.remaining()).toBe(0);
    expect(loadReviewStates().find((s) => s.wordId === 'a')?.intervalDays).toBe(1);
  });

  it('keeps progress stored for other words', () => {
    const other = review(createReviewState('other', NOW), 'know', NOW);
    saveReviewStates([other]);

    startReviewMode(container, { words: [word('a')], now });
    answer(container, 'know');

    expect(loadReviewStates()[0]).toEqual(other);
    expect(loadReviewStates()).toHaveLength(2);
  });

  it('removes itself on destroy', () => {
    const mode = startReviewMode(container, { words: [word('a')], now });

    mode.destroy();

    expect(container.children).toHaveLength(0);
  });
});
