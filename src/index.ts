import { runHackerNewsFilter } from "./application/hacker-news-service.js";
import type { FilterType } from "./domain/usage-record.js";

const filter = process.argv[2] as FilterType | undefined;

const allowedFilters: FilterType[] = [
  "LONG_TITLE_BY_COMMENTS",
  "SHORT_TITLE_BY_POINTS",
];

if (!filter || !allowedFilters.includes(filter)) {
  console.error(
    "Usage: npm start -- LONG_TITLE_BY_COMMENTS | SHORT_TITLE_BY_POINTS",
  );

  process.exit(1);
}

try {
  const entries = await runHackerNewsFilter(filter);

  console.log(JSON.stringify(entries, null, 2));
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";

  console.error(`Crawler failed: ${message}`);

  process.exit(1);
}
