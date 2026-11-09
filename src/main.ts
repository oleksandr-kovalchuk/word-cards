import './style.css';
import { addWord, loadWords } from './storage';
import { createWord, type Word } from './word';

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  app.innerHTML = `
    <header>
      <h1>Word Cards</h1>
      <p>Learn English words with flashcards.</p>
    </header>
    <main>
      <form class="add-word" novalidate>
        <input name="term" placeholder="English word" aria-label="English word" autocomplete="off" required />
        <input name="translation" placeholder="Translation" aria-label="Translation" autocomplete="off" required />
        <button type="submit">Add</button>
      </form>
      <p class="error" role="alert" hidden></p>
      <p class="empty">Nothing here yet.</p>
      <ul class="word-list"></ul>
    </main>
  `;

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
    form.reset();
    termInput.focus();
  });

  renderList(loadWords());
}
