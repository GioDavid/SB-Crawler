import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { fetchHackerNewsHtml } from './hacker-news-client.js';

describe('fetchHackerNewsHtml', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns HTML for a successful response', async () => {
    const html = '<html><body>Test</body></html>';

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(html, { status: 200 }),
    );

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      fetchHackerNewsHtml(),
    ).resolves.toBe(html);

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('throws when Hacker News returns HTTP 404', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, { status: 404 }),
    );

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      fetchHackerNewsHtml(),
    ).rejects.toThrow(
      'Failed to fetch Hacker News: HTTP 404',
    );
  });

  it('propagates network errors', async () => {
    const fetchMock = vi.fn().mockRejectedValue(
      new Error('Network error'),
    );

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      fetchHackerNewsHtml(),
    ).rejects.toThrow('Network error');
  });
});