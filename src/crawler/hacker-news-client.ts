const HACKER_NEWS_URL = 'https://news.ycombinator.com/';
const REQUEST_TIMEOUT_MS = 5_000;

export interface EntriesQuery {
  filter?: string;
  pages?: string;
}

export async function fetchHackerNewsHtml(
  page: number = 1,
): Promise<string> {
  const url = new URL(HACKER_NEWS_URL);

  url.searchParams.set("p", page.toString());

  const response = await fetch(url, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (response.status === 429) {
    throw new Error(
      `Rate limited while fetching Hacker News page ${page}`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Hacker News: HTTP ${response.status}`,
    );
  }

  return response.text();
}