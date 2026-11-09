import { beforeEach, describe, expect, it } from 'vitest';
import { renderStats } from './stats-view';

describe('renderStats', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  function value(stat: string): string | null {
    return container.querySelector(`[data-stat="${stat}"] dd`)?.textContent ?? null;
  }

  it('shows every number with its label', () => {
    renderStats(container, { total: 12, learned: 3, dueToday: 5, streak: 4 });

    expect(value('total')).toBe('12');
    expect(value('learned')).toBe('3');
    expect(value('dueToday')).toBe('5');
    expect(value('streak')).toBe('4');
    expect([...container.querySelectorAll('dt')].map((dt) => dt.textContent)).toEqual([
      'Words',
      'Learned',
      'Due today',
      'Day streak',
    ]);
  });

  it('replaces what was rendered before', () => {
    renderStats(container, { total: 1, learned: 0, dueToday: 1, streak: 0 });
    renderStats(container, { total: 2, learned: 1, dueToday: 0, streak: 1 });

    expect(container.querySelectorAll('.stats')).toHaveLength(1);
    expect(value('total')).toBe('2');
  });
});
