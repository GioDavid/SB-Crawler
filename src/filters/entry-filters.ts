import type { HackerNewsEntry } from '../domain/hacker-news-entry.js';
import { countWords } from './count-words.js';

export function filterLongTitles(
  entries: HackerNewsEntry[],
): HackerNewsEntry[] {
  return entries
    .filter((entry) => countWords(entry.title) > 5)
    .sort((a, b) => b.comments - a.comments);
}

export function filterShortTitles(
  entries: HackerNewsEntry[],
): HackerNewsEntry[] {
  return entries
    .filter((entry) => countWords(entry.title) <= 5)
    .sort((a, b) => b.points - a.points);
}