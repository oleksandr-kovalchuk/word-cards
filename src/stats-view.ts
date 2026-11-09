import { LEARNED_INTERVAL_DAYS, type Stats } from './stats';

const ITEMS: { key: keyof Stats; label: string }[] = [
  { key: 'total', label: 'Words' },
  { key: 'learned', label: 'Learned' },
  { key: 'dueToday', label: 'Due today' },
  { key: 'streak', label: 'Day streak' },
];

/** Renders the stats as a list of labelled numbers, replacing the container's content. */
export function renderStats(container: HTMLElement, stats: Stats): void {
  const list = document.createElement('dl');
  list.className = 'stats';

  for (const { key, label } of ITEMS) {
    const item = document.createElement('div');
    item.className = 'stat';
    item.dataset.stat = key;
    const term = document.createElement('dt');
    term.textContent = label;
    const value = document.createElement('dd');
    value.textContent = String(stats[key]);
    item.append(term, value);
    list.append(item);
  }

  const hint = document.createElement('p');
  hint.className = 'stats-hint';
  hint.textContent = `A word counts as learned once it is scheduled ${LEARNED_INTERVAL_DAYS} or more days ahead.`;

  container.replaceChildren(list, hint);
}
