import { fetchHackerNewsHtml } from '../crawler/hacker-news-client.js';
import { parseHackerNewsEntries } from '../crawler/hacker-news-parser.js';
import {
  filterLongTitles,
  filterShortTitles,
} from '../filters/entry-filters.js';
import { saveUsageRecord } from '../storage/usage-store.js';

import type { HackerNewsEntry } from '../domain/hacker-news-entry.js';
import type { FilterType } from '../domain/usage-record.js';

export async function runHackerNewsFilter(
  filter: FilterType,
): Promise<HackerNewsEntry[]> {
  const html = await fetchHackerNewsHtml();
  const entries = parseHackerNewsEntries(html);

  const result =
    filter === 'LONG_TITLE_BY_COMMENTS'
      ? filterLongTitles(entries)
      : filterShortTitles(entries);

  await saveUsageRecord({
    timestamp: new Date().toISOString(),
    filter,
  });

  return result;
}