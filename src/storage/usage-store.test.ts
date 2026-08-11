import { afterEach, describe, expect, it } from "vitest";

import { mkdtemp, readFile, rm } from "node:fs/promises";

import { tmpdir } from "node:os";
import { join } from "node:path";

import { saveUsageRecord } from "./usage-store.js";

describe("saveUsageRecord", () => {
  const directories: string[] = [];

  afterEach(async () => {
    await Promise.all(
      directories.map((directory) =>
        rm(directory, {
          recursive: true,
          force: true,
        }),
      ),
    );

    directories.length = 0;
  });

  it("stores timestamp and applied filter", async () => {
    const directory = await mkdtemp(join(tmpdir(), "hn-usage-"));

    directories.push(directory);

    const filePath = join(directory, "usage.jsonl");

    await saveUsageRecord(
      {
        timestamp: "2026-08-10T12:00:00.000Z",
        filter: "LONG_TITLE_BY_COMMENTS",
      },
      filePath,
    );

    const content = await readFile(filePath, "utf8");

    const record = JSON.parse(content.trim());

    expect(record).toEqual({
      timestamp: "2026-08-10T12:00:00.000Z",
      filter: "LONG_TITLE_BY_COMMENTS",
    });
  });

  it("appends multiple usage records", async () => {
    const directory = await mkdtemp(join(tmpdir(), "hn-usage-"));

    directories.push(directory);

    const filePath = join(directory, "usage.jsonl");

    await saveUsageRecord(
      {
        timestamp: "2026-08-10T12:00:00.000Z",
        filter: "LONG_TITLE_BY_COMMENTS",
      },
      filePath,
    );

    await saveUsageRecord(
      {
        timestamp: "2026-08-10T12:01:00.000Z",
        filter: "SHORT_TITLE_BY_POINTS",
      },
      filePath,
    );

    const content = await readFile(filePath, "utf8");

    const records = content
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));

    expect(records).toHaveLength(2);
  });
});
