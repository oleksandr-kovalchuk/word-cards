import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEY, addWord, loadWords, saveWords } from './storage';
import { createWord } from './word';

describe('word storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns an empty list when nothing is saved', () => {
    expect(loadWords()).toEqual([]);
  });

  it('saves and loads words', () => {
    const words = [createWord('apple', 'яблуко'), createWord('cat', 'кіт')];

    saveWords(words);

    expect(loadWords()).toEqual(words);
  });

  it('appends a word with addWord and keeps the order', () => {
    const apple = createWord('apple', 'яблуко');
    const cat = createWord('cat', 'кіт');

    addWord(apple);
    const result = addWord(cat);

    expect(result).toEqual([apple, cat]);
    expect(loadWords()).toEqual([apple, cat]);
  });

  it('returns an empty list for broken JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');

    expect(loadWords()).toEqual([]);
  });

  it('returns an empty list when the stored value is not an array', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ term: 'apple' }));

    expect(loadWords()).toEqual([]);
  });

  it('skips entries that are not words', () => {
    const apple = createWord('apple', 'яблуко');
    localStorage.setItem(STORAGE_KEY, JSON.stringify([apple, { term: 'cat' }, null, 42]));

    expect(loadWords()).toEqual([apple]);
  });

  it('works with a storage passed in explicitly', () => {
    const storage = window.sessionStorage;
    storage.clear();
    const apple = createWord('apple', 'яблуко');

    addWord(apple, storage);

    expect(loadWords(storage)).toEqual([apple]);
    expect(loadWords()).toEqual([]);
  });
});
