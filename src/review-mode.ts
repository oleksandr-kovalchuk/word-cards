import { recordReviewDay } from './review-days-storage';
import { applyAnswer, getDueWords } from './review-session';
import { loadReviewStates, saveReviewStates } from './review-storage';
import { renderReviewCard, type ReviewCard } from './review-view';
import type { Word } from './word';

export interface ReviewModeOptions {
  /** All words the user has added. */
  words: Word[];
  /** Where review progress is stored. Defaults to localStorage. */
  storage?: Storage;
  /** Returns the current time. Injected for tests. */
  now?: () => Date;
  /** Called with the number of cards left when the session starts and after every answer. */
  onProgress?: (remaining: number) => void;
}

export interface ReviewMode {
  /** Number of cards still waiting in this session. */
  remaining: () => number;
  /** Removes the review mode from the DOM. */
  destroy: () => void;
}

/**
 * Runs a review session in `container`: shows each due word as a flashcard,
 * applies the scheduler to every answer and saves the progress right away.
 * A card answered with "I don't know it" comes back at the end of the session.
 * Every answer also records today as a review day for the streak.
 */
export function startReviewMode(
  container: HTMLElement,
  { words, storage = localStorage, now = () => new Date(), onProgress }: ReviewModeOptions,
): ReviewMode {
  const root = document.createElement('div');
  root.className = 'review-mode';

  const status = document.createElement('p');
  status.className = 'review-status';
  status.setAttribute('aria-live', 'polite');

  const stage = document.createElement('div');
  root.append(status, stage);
  container.append(root);

  const queue = getDueWords(words, loadReviewStates(storage), now());
  let card: ReviewCard | null = null;

  const showNext = (): void => {
    card?.destroy();
    card = null;

    const word = queue[0];
    if (!word) {
      status.textContent = 'All done for now. Come back later for more cards.';
      return;
    }

    status.textContent = `Cards left: ${queue.length}`;
    card = renderReviewCard(stage, word, {
      onAnswer: (answer) => {
        // Read fresh states so other tabs' progress is not overwritten.
        saveReviewStates(applyAnswer(loadReviewStates(storage), word.id, answer, now()), storage);
        recordReviewDay(now(), storage);
        queue.shift();
        if (answer === 'dont-know') queue.push(word);
        onProgress?.(queue.length);
        showNext();
      },
    });
  };

  onProgress?.(queue.length);
  if (queue.length === 0) {
    status.textContent = words.length === 0 ? 'Add some words first.' : 'No cards to review right now.';
  } else {
    showNext();
  }

  return {
    remaining: () => queue.length,
    destroy: () => root.remove(),
  };
}
