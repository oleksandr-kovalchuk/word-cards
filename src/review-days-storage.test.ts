import { beforeEach, describe, expect, it } from 'vitest';
import {
  REVIEW_DAYS_STORAGE_KEY,
  loadReviewDays,
  recordReviewDay,
  saveReviewDays,
} from './review-days-storage';
import { REVIEW_STORAGE_KEY } from './review-storage';
import { STORAGE_KEY } from './storage';

describe('review days storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('uses its own key', () => {
    expect([STORAGE_KEY, REVIEW_STORAGE_KEY]).not.toContain(REVIEW_DAYS_STORAGE_KEY);
  });

  it('returns an empty list when nothing is saved', () => {
    expect(loadReviewDays()).toEqual([]);
  });

  it('saves and loads days', () => {
    saveReviewDays(['2026-11-08', '2026-11-09']);
    expect(loadReviewDays()).toEqual(['2026-11-08', '2026-11-09']);
  });

  it('returns an empty list for broken JSON or a non-array', () => {
    localStorage.setItem(REVIEW_DAYS_STORAGE_KEY, '{not json');
    expect(loadReviewDays()).toEqual([]);
    localStorage.setItem(REVIEW_DAYS_STORAGE_KEY, '"2026-11-09"');
    expect(loadReviewDays()).toEqual([]);
  });

  it('skips entries that are not day keys', () => {
    localStorage.setItem(REVIEW_DAYS_STORAGE_KEY, JSON.stringify(['2026-11-09', 'today', 7, null]));
    expect(loadReviewDays()).toEqual(['2026-11-09']);
  });

  it('records each day once', () => {
    recordReviewDay(new Date(2026, 10, 9, 8));
    recordReviewDay(new Date(2026, 10, 9, 20));
    recordReviewDay(new Date(2026, 10, 10, 8));

    expect(loadReviewDays()).toEqual(['2026-11-09', '2026-11-10']);
  });
});
