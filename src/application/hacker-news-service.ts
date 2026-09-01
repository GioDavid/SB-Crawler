import { fetchHackerNewsHtml } from "../crawler/hacker-news-client.js";
import { parseHackerNewsEntries } from "../crawler/hacker-news-parser.js";
import {
  filterLongTitles,
  filterShortTitles,
} from "../filters/entry-filters.js";
import { saveUsageRecord } from "../storage/usage-store.js";

import type { HackerNewsEntry } from "../domain/hacker-news-entry.js";
import type { FilterType } from "../domain/usage-record.js";
import { crawlHackerNewsPages } from "../crawler/hacker-news-crawler.js";


export async function runHackerNewsFilterSinglePage(
  filter: FilterType,
  pages: number =1,
): Promise<HackerNewsEntry[]> {
  const html = await fetchHackerNewsHtml(pages);
  const entries = parseHackerNewsEntries(html);

  const result =
    filter === "LONG_TITLE_BY_COMMENTS"
      ? filterLongTitles(entries)
      : filterShortTitles(entries);

  await saveUsageRecord({
    timestamp: new Date().toISOString(),
    filter,
  });

  return result;
}

export async function runHackerNewsFilter(
  filter: FilterType,
  pages: number =1,
): Promise<HackerNewsEntry[]> {
  const entries = await crawlHackerNewsPages(pages);

  const result =
    filter === "LONG_TITLE_BY_COMMENTS"
      ? filterLongTitles(entries)
      : filterShortTitles(entries);

  await saveUsageRecord({
    timestamp: new Date().toISOString(),
    filter,
  });

  return result;
}
