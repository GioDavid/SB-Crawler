# ARCHITECTURE.md

## 1. System Overview

The project is a TypeScript-based Hacker News web crawler that collects, pa[2D[K
parses, filters, and sorts entries based on their title word count. The arc[3D[K
architecture prioritizes simplicity, maintainability, testability, performa[8D[K
performance, and clean design.

## 2. Module Boundaries

- **Crawler Module**: Handles HTTP requests to fetch the Hacker News homepa[6D[K
homepage.
- **Parser Module**: Extracts structured data from the HTML content.
- **Domain Module**: Defines `HackerNewsEntry` types for consistency.
- **Filtering Module**: Implements the logic for filtering entries by title[5D[K
title word count.
- **Word Counting Module**: Calculates the number of words in each title.
- **Usage Tracking Module**: Records usage information for filter operation[9D[K
operations.
- **Application Module**: Orchestrates the entire process from crawling to [K
usage tracking.

## 3. Domain Types

```typescript
// HackerNewsEntry.ts
type HackerNewsEntry = {
  number: number;
  title: string;
  points: number | null;
  comments: number | null;
};
```

## 4. Data Flow

1. **Crawler**: Fetches the Hacker News homepage.
2. **Parser**: Extracts entries from the HTML content.
3. **Domain**: Normalizes missing data and prepares entries for processing.[11D[K
processing.
4. **Filtering & Sorting**:
   - Long Title Filter: Entries with more than five words, sorted by commen[6D[K
comments.
   - Short Title Filter: Entries with five or fewer words, sorted by points[6D[K
points.
5. **Usage Tracking**: Records filter usage with timestamps and identifiers[11D[K
identifiers.
6. **Persistence**: Stores usage information in a simple data structure (e.[3D[K
(e.g., JSON file).

## 5. HTTP Fetching Strategy

- Uses the `fetch` API to retrieve Hacker News data.
- Handles network errors gracefully, providing fallback mechanisms if neces[5D[K
necessary.

## 6. HTML Parsing Strategy

- Utilizes Cheerio for DOM manipulation and extraction of entry details.
- Ensures robust handling of missing or malformed HTML structures.

## 7. Filtering Strategy

- Filters entries based on the number of words in their titles.
- Uses simple string manipulation to count words and handle punctuation cor[3D[K
correctly.

## 8. Word-counting Responsibility

- Counts words by splitting strings at whitespace while ignoring standalone[10D[K
standalone symbols.
- Ensures that only valid tokens are counted, treating hyphenated words as [K
one token.

## 9. Usage Persistence Strategy

- Stores usage records in a JSON file for simple persistence.
- Implements basic validation to ensure data integrity before writing.

## 10. Error Handling

- Handles `fetch` errors and provides meaningful error messages.
- Uses default values for missing data points (e.g., zero for points and co[2D[K
comments).

## 11. Testing Strategy

- Includes unit tests for word counting, filtering logic, sorting, and pers[4D[K
persistence.
- Tests edge cases such as empty collections, missing values, and network f[1D[K
failures.

## 12. Dependency Choices

- Uses Cheerio for HTML parsing without unnecessary dependencies.
- Avoids using frameworks or abstractions that complicate the architecture.[13D[K
architecture.

## 13. Performance Considerations

- Optimizes operations to handle only the required 30 entries efficiently.
- Minimizes DOM manipulations and ensures that state transitions are minima[6D[K
minimal.

## 14. Non-Functional Requirements

- Uses TypeScript for type safety and robustness.
- Ensures maintainability through clear, focused functions and well-documen[12D[K
well-documented code.
- Tests business rules independently of network interactions to ensure reli[4D[K
reliability.

## 15. Edge Cases

- Normalizes missing point and comment values to zero.
- Handles titles with exactly five or six valid words correctly.
- Safely handles standalone symbols and hyphenated words.

## 16. Next Phase

The next artifact must be:

```text
docs/SPEC.md

```

The Specification Agent will convert each functional requirement into preci[5D[K
precise technical behavior and test scenarios before implementation begins.[7D[K
begins.

READY_FOR_SPECIFICATION: YES

