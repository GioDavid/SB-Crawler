const HACKER_NEWS_URL = 'https://news.ycombinator.com/';

export async function fetchHackerNewsHtml(): Promise<string> {
  const response = await fetch(HACKER_NEWS_URL);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Hacker News: HTTP ${response.status}`,
    );
  }

  return response.text();
}