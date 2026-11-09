import './style.css';
import { startReviewMode, type ReviewMode } from './review-mode';
import { getDueWords } from './review-session';
import { loadReviewDays } from './review-days-storage';
import { loadReviewStates } from './review-storage';
import { getStats } from './stats';
import { renderStats } from './stats-view';
import { addWord, loadWords } from './storage';
import { createWord, type Word } from './word';

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  app.innerHTML = `
    <header>
      <h1>Word Cards</h1>
      <p>Learn English words with flashcards.</p>
      <nav class="tabs">
        <button type="button" class="tab" data-view="words" aria-pressed="true">Words</button>
        <button type="button" class="tab" data-view="review" aria-pressed="false">Review <span class="due-count"></span></button>
        <button type="button" class="tab" data-view="stats" aria-pressed="false">Stats</button>
      </nav>
    </header>
    <main class="view-words">
      <form class="add-word" novalidate>
        <input name="term" placeholder="English word" aria-label="English word" autocomplete="off" required />
        <input name="translation" placeholder="Translation" aria-label="Translation" autocomplete="off" required />
        <button type="submit">Add</button>
      </form>
      <p class="error" role="alert" hidden></p>
      <p class="empty">Nothing here yet.</p>
      <ul class="word-list"></ul>
    </main>
    <main class="view-review" hidden></main>
    <main class="view-stats" hidden></main>
  `;

  const wordsView = app.querySelector<HTMLElement>('.view-words')!;
  const reviewView = app.querySelector<HTMLElement>('.view-review')!;
  const statsView = app.querySelector<HTMLElement>('.view-stats')!;
  const dueCount = app.querySelector<HTMLSpanElement>('.due-count')!;
  const tabs = app.querySelectorAll<HTMLButtonElement>('.tab');
  let reviewMode: ReviewMode | null = null;

  type View = 'words' | 'review' | 'stats';

  const setDueCount = (due: number): void => {
    dueCount.textContent = due > 0 ? `(${due})` : '';
  };

  const updateDueCount = (): void => {
    setDueCount(getDueWords(loadWords(), loadReviewStates()).length);
  };

  const showView = (view: View): void => {
    tabs.forEach((tab) => tab.setAttribute('aria-pressed', String(tab.dataset.view === view)));
    wordsView.hidden = view !== 'words';
    reviewView.hidden = view !== 'review';
    statsView.hidden = view !== 'stats';

    reviewMode?.destroy();
    reviewMode = null;
    if (view === 'review') {
      // The tab counter follows the session, so it goes down with every answer.
      reviewMode = startReviewMode(reviewView, { words: loadWords(), onProgress: setDueCount });
    } else {
      updateDueCount();
    }
    if (view === 'stats') {
      renderStats(statsView, getStats(loadWords(), loadReviewStates(), loadReviewDays()));
    }
  };

  const toView = (value: string | undefined): View =>
    value === 'review' || value === 'stats' ? value : 'words';

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => showView(toView(tab.dataset.view)));
  });

  const form = app.querySelector<HTMLFormElement>('.add-word')!;
  const termInput = form.querySelector<HTMLInputElement>('[name="term"]')!;
  const translationInput = form.querySelector<HTMLInputElement>('[name="translation"]')!;
  const error = app.querySelector<HTMLParagraphElement>('.error')!;
  const empty = app.querySelector<HTMLParagraphElement>('.empty')!;
  const list = app.querySelector<HTMLUListElement>('.word-list')!;

  const renderList = (words: Word[]): void => {
    empty.hidden = words.length > 0;
    list.replaceChildren(
      ...words.map((word) => {
        const item = document.createElement('li');
        const term = document.createElement('span');
        term.className = 'term';
        term.textContent = word.term;
        const translation = document.createElement('span');
        translation.className = 'translation';
        translation.textContent = word.translation;
        item.append(term, translation);
        return item;
      }),
    );
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let word: Word;
    try {
      word = createWord(termInput.value, translationInput.value);
    } catch {
      error.textContent = 'Please enter both the word and its translation.';
      error.hidden = false;
      return;
    }

    error.hidden = true;
    renderList(addWord(word));
    updateDueCount();
    form.reset();
    termInput.focus();
  });

  renderList(loadWords());
  updateDueCount();
}
