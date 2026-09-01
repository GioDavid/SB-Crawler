import type { HackerNewsEntry } from "../domain/hacker-news-entry.js";

import { fetchHackerNewsHtml } from "./hacker-news-client.js";
import { parseHackerNewsEntries } from "./hacker-news-parser.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function crawlHackerNewsPages(
  pageCount: number = 1,
): Promise<HackerNewsEntry[]> {
  const entries: HackerNewsEntry[] = [];

  for (let page = 1; page <= pageCount; page++) {
    const html = await fetchHackerNewsHtml(page);
    console.log("fetch new page" + page);

    const pageEntries = parseHackerNewsEntries(html);

    entries.push(...pageEntries);

    if (page < pageCount) {
      await sleep(700);
    }
  }

  return entries;
}
