/** A single word the user is learning. */
export interface Word {
  id: string;
  /** The English word or phrase. */
  term: string;
  /** Translation into the user's language. */
  translation: string;
  /** ISO 8601 timestamp of when the word was added. */
  createdAt: string;
}

/** Creates a new word with trimmed text. Throws if term or translation is empty. */
export function createWord(term: string, translation: string, now: Date = new Date()): Word {
  const cleanTerm = term.trim();
  const cleanTranslation = translation.trim();

  if (!cleanTerm || !cleanTranslation) {
    throw new Error('Term and translation must not be empty');
  }

  return {
    id: crypto.randomUUID(),
    term: cleanTerm,
    translation: cleanTranslation,
    createdAt: now.toISOString(),
  };
}
