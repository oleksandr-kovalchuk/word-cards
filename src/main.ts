import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  app.innerHTML = `
    <header>
      <h1>Word Cards</h1>
      <p>Learn English words with flashcards.</p>
    </header>
    <main>
      <p class="empty">Nothing here yet.</p>
    </main>
  `;
}
