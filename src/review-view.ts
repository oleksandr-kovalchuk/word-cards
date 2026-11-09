import './review-view.css';
import type { Word } from './word';

/** The user's self-assessment for a card. */
export type ReviewAnswer = 'know' | 'dont-know';

export interface ReviewCardOptions {
  /** Called once, when the user picks an answer. */
  onAnswer: (answer: ReviewAnswer) => void;
}

export interface ReviewCard {
  /** The card's root element, already appended to the container. */
  element: HTMLElement;
  /** Removes the card from the DOM. */
  destroy: () => void;
}

/**
 * Renders a flashcard for one word into `container`.
 *
 * The card shows the term first. "Show translation" reveals the translation
 * and the "I know it" / "I don't know it" buttons. The answer is reported
 * through `onAnswer` exactly once; after that the buttons are disabled.
 * The view knows nothing about intervals or storage.
 */
export function renderReviewCard(
  container: HTMLElement,
  word: Word,
  { onAnswer }: ReviewCardOptions,
): ReviewCard {
  const card = document.createElement('section');
  card.className = 'review-card';
  card.setAttribute('aria-label', 'Flashcard');

  const term = document.createElement('p');
  term.className = 'review-term';
  term.textContent = word.term;

  const translation = document.createElement('p');
  translation.className = 'review-translation';
  translation.textContent = word.translation;
  translation.hidden = true;

  const reveal = document.createElement('button');
  reveal.type = 'button';
  reveal.className = 'review-reveal';
  reveal.textContent = 'Show translation';

  const answers = document.createElement('div');
  answers.className = 'review-answers';
  answers.hidden = true;

  const dontKnow = createAnswerButton('dont-know', "I don't know it");
  const know = createAnswerButton('know', 'I know it');
  answers.append(dontKnow, know);

  card.append(term, translation, reveal, answers);
  container.append(card);

  reveal.addEventListener('click', () => {
    translation.hidden = false;
    reveal.hidden = true;
    answers.hidden = false;
    know.focus();
  });

  let answered = false;
  const answer = (value: ReviewAnswer): void => {
    if (answered) return;
    answered = true;
    know.disabled = true;
    dontKnow.disabled = true;
    onAnswer(value);
  };

  know.addEventListener('click', () => answer('know'));
  dontKnow.addEventListener('click', () => answer('dont-know'));

  return {
    element: card,
    destroy: () => card.remove(),
  };
}

function createAnswerButton(answer: ReviewAnswer, label: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `review-answer review-answer--${answer}`;
  button.dataset.answer = answer;
  button.textContent = label;
  return button;
}
