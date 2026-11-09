import './style.css';
import { startReviewMode, type ReviewMode } from './review-mode';
import { getDueWords } from './review-session';
import { loadReviewStates } from './review-storage';
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
  `;

  const wordsView = app.querySelector<HTMLElement>('.view-words')!;
  const reviewView = app.querySelector<HTMLElement>('.view-review')!;
  const dueCount = app.querySelector<HTMLSpanElement>('.due-count')!;
  const tabs = app.querySelectorAll<HTMLButtonElement>('.tab');
  let reviewMode: ReviewMode | null = null;

  const updateDueCount = (): void => {
    const due = getDueWords(loadWords(), loadReviewStates()).length;
    dueCount.textContent = due > 0 ? `(${due})` : '';
  };

  const showView = (view: 'words' | 'review'): void => {
    tabs.forEach((tab) => tab.setAttribute('aria-pressed', String(tab.dataset.view === view)));
    wordsView.hidden = view !== 'words';
    reviewView.hidden = view !== 'review';

    reviewMode?.destroy();
    reviewMode = null;
    if (view === 'review') {
      reviewMode = startReviewMode(reviewView, { words: loadWords() });
    } else {
      updateDueCount();
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => showView(tab.dataset.view === 'review' ? 'review' : 'words'));
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
