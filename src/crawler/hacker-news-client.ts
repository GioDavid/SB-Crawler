const HACKER_NEWS_URL = 'https://news.ycombinator.com/';
const REQUEST_TIMEOUT_MS = 5_000;

export async function fetchHackerNewsHtml(): Promise<string> {
  const response = await fetch(HACKER_NEWS_URL, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Hacker News: HTTP ${response.status}`,
    );
  }

  return response.text();
}