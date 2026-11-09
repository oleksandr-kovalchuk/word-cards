import { describe, expect, it } from 'vitest';
import { createWord } from './word';

describe('createWord', () => {
  it('trims term and translation', () => {
    const word = createWord('  apple ', ' яблуко  ');

    expect(word.term).toBe('apple');
    expect(word.translation).toBe('яблуко');
  });

  it('stores the creation time', () => {
    const word = createWord('apple', 'яблуко', new Date('2026-01-01T10:00:00Z'));

    expect(word.createdAt).toBe('2026-01-01T10:00:00.000Z');
  });

  it('gives every word a unique id', () => {
    expect(createWord('a', 'b').id).not.toBe(createWord('a', 'b').id);
  });

  it('rejects empty values', () => {
    expect(() => createWord('   ', 'яблуко')).toThrow();
    expect(() => createWord('apple', '')).toThrow();
  });
});
