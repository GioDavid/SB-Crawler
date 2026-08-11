import { beforeEach, describe, expect, it, vi } from "vitest";

import type { HackerNewsEntry } from "../domain/hacker-news-entry.js";

vi.mock("../crawler/hacker-news-client.js", () => ({
  fetchHackerNewsHtml: vi.fn(),
}));

vi.mock("../crawler/hacker-news-parser.js", () => ({
  parseHackerNewsEntries: vi.fn(),
}));

vi.mock("../filters/entry-filters.js", () => ({
  filterLongTitles: vi.fn(),
  filterShortTitles: vi.fn(),
}));

vi.mock("../storage/usage-store.js", () => ({
  saveUsageRecord: vi.fn(),
}));

import { fetchHackerNewsHtml } from "../crawler/hacker-news-client.js";
import { parseHackerNewsEntries } from "../crawler/hacker-news-parser.js";
import {
  filterLongTitles,
  filterShortTitles,
} from "../filters/entry-filters.js";
import { saveUsageRecord } from "../storage/usage-store.js";

import { runHackerNewsFilter } from "./hacker-news-service.js";

describe("runHackerNewsFilter", () => {
  const entries: HackerNewsEntry[] = [
    {
      number: 1,
      title: "Short title",
      points: 20,
      comments: 5,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(fetchHackerNewsHtml).mockResolvedValue("<html></html>");
    vi.mocked(parseHackerNewsEntries).mockReturnValue(entries);
  });

  it("applies the long-title filter", async () => {
    const filtered: HackerNewsEntry[] = [
      {
        number: 2,
        title: "This title has exactly six words",
        points: 10,
        comments: 50,
      },
    ];

    vi.mocked(filterLongTitles).mockReturnValue(filtered);

    const result = await runHackerNewsFilter("LONG_TITLE_BY_COMMENTS");

    expect(filterLongTitles).toHaveBeenCalledWith(entries);
    expect(filterShortTitles).not.toHaveBeenCalled();

    expect(result).toEqual(filtered);

    expect(saveUsageRecord).toHaveBeenCalledWith({
      timestamp: expect.any(String),
      filter: "LONG_TITLE_BY_COMMENTS",
    });
  });

  it("applies the short-title filter", async () => {
    const filtered: HackerNewsEntry[] = [
      {
        number: 1,
        title: "Short title",
        points: 20,
        comments: 5,
      },
    ];

    vi.mocked(filterShortTitles).mockReturnValue(filtered);

    const result = await runHackerNewsFilter("SHORT_TITLE_BY_POINTS");

    expect(filterShortTitles).toHaveBeenCalledWith(entries);
    expect(filterLongTitles).not.toHaveBeenCalled();

    expect(result).toEqual(filtered);

    expect(saveUsageRecord).toHaveBeenCalledWith({
      timestamp: expect.any(String),
      filter: "SHORT_TITLE_BY_POINTS",
    });
  });

  it("stores a valid ISO timestamp", async () => {
    vi.mocked(filterLongTitles).mockReturnValue([]);

    await runHackerNewsFilter("LONG_TITLE_BY_COMMENTS");

    const call = vi.mocked(saveUsageRecord).mock.calls[0];

    const record = call?.[0];

    expect(record).toBeDefined();

    expect(Number.isNaN(Date.parse(record!.timestamp))).toBe(false);
  });
});
