import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderReviewCard } from './review-view';
import type { ReviewAnswer } from './srs';
import type { Word } from './word';

const word: Word = {
  id: 'w1',
  term: 'apple',
  translation: 'яблуко',
  createdAt: '2026-11-09T00:00:00.000Z',
};

function query<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing ${selector}`);
  return element;
}

describe('renderReviewCard', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.append(container);
  });

  it('shows the term and hides the translation and answers at first', () => {
    renderReviewCard(container, word, { onAnswer: vi.fn() });

    expect(query(container, '.review-term').textContent).toBe('apple');
    expect(query<HTMLElement>(container, '.review-translation').hidden).toBe(true);
    expect(query<HTMLElement>(container, '.review-answers').hidden).toBe(true);
    expect(query<HTMLElement>(container, '.review-reveal').hidden).toBe(false);
  });

  it('reveals the translation and answer buttons on click', () => {
    renderReviewCard(container, word, { onAnswer: vi.fn() });

    query<HTMLButtonElement>(container, '.review-reveal').click();

    const translation = query<HTMLElement>(container, '.review-translation');
    expect(translation.hidden).toBe(false);
    expect(translation.textContent).toBe('яблуко');
    expect(query<HTMLElement>(container, '.review-answers').hidden).toBe(false);
    expect(query<HTMLElement>(container, '.review-reveal').hidden).toBe(true);
  });

  it.each<ReviewAnswer>(['know', 'dont-know'])('reports "%s" through the callback', (answer) => {
    const onAnswer = vi.fn();
    renderReviewCard(container, word, { onAnswer });

    query<HTMLButtonElement>(container, '.review-reveal').click();
    query<HTMLButtonElement>(container, `[data-answer="${answer}"]`).click();

    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith(answer);
  });

  it('reports only the first answer and disables the buttons', () => {
    const onAnswer = vi.fn();
    renderReviewCard(container, word, { onAnswer });

    query<HTMLButtonElement>(container, '.review-reveal').click();
    const know = query<HTMLButtonElement>(container, '[data-answer="know"]');
    const dontKnow = query<HTMLButtonElement>(container, '[data-answer="dont-know"]');
    know.click();
    dontKnow.click();
    know.click();

    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith('know');
    expect(know.disabled).toBe(true);
    expect(dontKnow.disabled).toBe(true);
  });

  it('renders text safely, without parsing HTML', () => {
    renderReviewCard(container, { ...word, term: '<b>bold</b>' }, { onAnswer: vi.fn() });

    expect(query(container, '.review-term').textContent).toBe('<b>bold</b>');
    expect(container.querySelector('b')).toBeNull();
  });

  it('removes the card on destroy', () => {
    const card = renderReviewCard(container, word, { onAnswer: vi.fn() });

    expect(container.contains(card.element)).toBe(true);
    card.destroy();
    expect(container.contains(card.element)).toBe(false);
  });
});
