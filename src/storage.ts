import type { Word } from './word';

/** localStorage key that holds the saved words. */
export const STORAGE_KEY = 'word-cards:words';

function isWord(value: unknown): value is Word {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.term === 'string' &&
    typeof v.translation === 'string' &&
    typeof v.createdAt === 'string'
  );
}

/**
 * Reads saved words. Returns an empty list when nothing is saved or the data
 * is broken, and skips entries that do not look like a Word.
 */
export function loadWords(storage: Storage = localStorage): Word[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isWord) : [];
  } catch {
    return [];
  }
}

/** Saves the whole word list, replacing what was stored before. */
export function saveWords(words: Word[], storage: Storage = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(words));
}

/** Adds a word to the stored list and returns the updated list. */
export function addWord(word: Word, storage: Storage = localStorage): Word[] {
  const words = [...loadWords(storage), word];
  saveWords(words, storage);
  return words;
}
