# Product Requirements Document — Hacker News Web Crawler

## 1. Overview

Build a TypeScript application that scrapes the first 30 entries from Hacker News and allows the collected entries to be filtered and sorted according to title word count, comments, and points.

The application must also record usage information whenever a filtering operation is performed.

The solution should prioritize correctness, performance, maintainability, testability, and clean TypeScript design.

---

## 2. Problem Statement

The application must retrieve the first 30 entries displayed on Hacker News:

`https://news.ycombinator.com/`

For each entry, the application must extract:

- Entry number
- Title
- Points
- Number of comments

The collected data must then support two filtering operations based on the number of words in each title.

Usage of these filters must also be recorded.

---

## 3. Goals

The solution must:

1. Reliably scrape the first 30 Hacker News entries.
2. Convert scraped information into a consistent internal data structure.
3. Correctly count words according to the challenge rules.
4. Support both required filtering operations.
5. Correctly sort filtered results.
6. Store information about filter usage.
7. Be implemented using TypeScript.
8. Be easy to test and maintain.
9. Include automated tests.
10. Document important engineering decisions.

---

## 4. Functional Requirements

### FR-001 — Retrieve Hacker News

The application must retrieve the Hacker News homepage.

The application must handle network failures without silently returning incorrect data.

---

### FR-002 — Extract First 30 Entries

The crawler must process the first 30 entries returned by Hacker News.

If fewer than 30 valid entries are available, the application must handle the situation gracefully rather than failing unexpectedly.

---

### FR-003 — Extract Entry Number

For every collected entry, the crawler must extract its displayed ranking number.

Example:

```text
1.
2.
3.

```

The application should represent the number as a numeric value.

---

### FR-004 — Extract Title

For every collected entry, the crawler must extract its title.

The title must be represented as a string.

---

### FR-005 — Extract Points

For every collected entry, the crawler must extract its number of points.

Points should be represented as a numeric value.

Because Hacker News entries may occasionally not contain points, missing values must be handled safely.

---

### FR-006 — Extract Comments

For every collected entry, the crawler must extract its number of comments.

Comments should be represented as a numeric value.

Entries without comments must be handled safely.

---

## 5. Word Counting Requirements

### FR-007 — Count Title Words

The application must determine the number of words contained in each title.

Words are primarily separated by whitespace.

Standalone symbols must not count as words.

For example:

```text
This is - a self-explained example

```

The whitespace-separated tokens are:

```text
This
is
-
a
self-explained
example

```

The `-` token contains only a symbol and must therefore be excluded.

The resulting word count is:

```text
5

```

`self-explained` counts as one word because it is a single whitespace-separated textual token.

The word-counting behavior must be independently testable.

---

## 6. Filtering Requirements

### FR-008 — Long Title Filter

The application must provide a filtering operation that selects entries whose titles contain:

```text
more than 5 words

```

The resulting entries must be ordered by:

```text
number of comments

```

with entries containing more comments appearing first.

---

### FR-009 — Short Title Filter

The application must provide a filtering operation that selects entries whose titles contain:

```text
5 words or fewer

```

The resulting entries must be ordered by:

```text
points

```

with entries containing more points appearing first.

---

### FR-010 — Preserve Original Data

Filtering and sorting operations should not mutate the original collection of scraped Hacker News entries.

This allows multiple filters to operate safely on the same dataset.

---

## 7. Usage Tracking

### FR-011 — Store Usage Information

Every filtering request must generate a usage record.

At minimum, the record must contain:

- Request timestamp
- Applied filter

Conceptually:

```text
UsageRecord

timestamp
filter

```

The exact storage technology will be selected during the architecture phase.

---

### FR-012 — Identify Filters

Each usage record must clearly identify which filtering operation was executed.

Possible conceptual identifiers include:

```text
LONG_TITLE_BY_COMMENTS
SHORT_TITLE_BY_POINTS

```

The final naming convention may be determined during implementation.

---

## 8. Data Requirements

The application requires a domain representation for a Hacker News entry.

Conceptually:

```text
HackerNewsEntry

number
title
points
comments

```

Expected types:

```text
number: number
title: string
points: number
comments: number

```

The architecture phase must determine how missing Hacker News metadata is normalized.

---

## 9. Non-Functional Requirements

### NFR-001 — Type Safety

The application must use TypeScript.

TypeScript strict mode should be enabled.

Unnecessary use of `any` should be avoided.

---

### NFR-002 — Maintainability

The implementation should:

- Use clear naming.
- Avoid duplicated business logic.
- Keep functions focused on a single responsibility.
- Separate scraping logic from filtering logic.
- Separate persistence from business rules.
- Avoid unnecessary abstractions.

---

### NFR-003 — Testability

Business rules must be testable independently from Hacker News network requests.

At minimum, automated tests should cover:

- Word counting
- Long-title filtering
- Short-title filtering
- Sorting by comments
- Sorting by points
- Boundary conditions
- Missing values
- Empty collections

---

### NFR-004 — Performance

The crawler should avoid unnecessary requests and processing.

The Hacker News page should not be downloaded separately for each filtering operation when the same retrieved dataset can be reused.

Filtering and sorting should operate efficiently over the small collection of 30 entries.

---

### NFR-005 — Reliability

Unexpected HTML content, missing metadata, or network failures must not cause silent data corruption.

Failures should be handled explicitly.

---

### NFR-006 — Code Quality

The project should follow consistent TypeScript conventions and include automated quality checks.

The implementation should support:

- TypeScript compilation/type checking
- ESLint
- Automated testing

---

## 10. Edge Cases

The implementation and tests must consider:

### Missing points

An entry may not contain a points value.

The system must normalize or safely represent this condition.

### Missing comments

An entry may contain:

```text
discuss

```

instead of a numeric comment count.

The system must handle this case safely.

### Exactly five words

A title containing exactly five valid words belongs to:

```text
SHORT_TITLE_BY_POINTS

```

### Six words

A title containing six valid words belongs to:

```text
LONG_TITLE_BY_COMMENTS

```

### Standalone symbols

Example:

```text
AI - the future of software

```

The standalone `-` must not count as a word.

### Hyphenated words

Example:

```text
AI-powered

```

This is one whitespace-separated textual token and therefore counts as one word.

### Empty input

Filtering an empty collection must return an empty collection.

### Fewer than 30 entries

The crawler should handle a response containing fewer than 30 valid entries without crashing.

### Network failure

Network errors must be surfaced or handled explicitly.

### HTML structure changes

The scraper should fail clearly if required Hacker News content can no longer be extracted reliably.

---

## 11. Assumptions

The following are assumptions rather than explicit challenge requirements:

1. Sorting by comments means descending order.
2. Sorting by points means descending order.
3. Missing comment counts may reasonably be normalized to zero.
4. Missing point values may reasonably be normalized to zero.
5. The application does not need to continuously monitor Hacker News.
6. Usage persistence does not require a remote production database.
7. Authentication is not required.
8. A graphical user interface is not required unless introduced by additional requirements.

Assumptions affecting observable behavior should be confirmed or documented in the final solution.

---

## 12. Out of Scope

Unless additional requirements are introduced, the following are outside the scope of the challenge:

- User authentication
- User accounts
- Hacker News login
- Posting Hacker News comments
- Voting
- Crawling article contents
- Crawling more than the required entries
- Continuous background crawling
- Distributed crawling
- Machine learning
- AI-generated article analysis

---

## 13. Acceptance Criteria

### AC-001

Given a valid Hacker News homepage response, the crawler extracts no more than the first 30 entries.

### AC-002

Every successfully parsed entry contains:

- number
- title
- points
- comments

in the application's normalized domain representation.

### AC-003

Given:

```text
This is - a self-explained example

```

the word-counting function returns:

```text
5

```

### AC-004

Given an entry containing exactly five valid title words, the entry qualifies for the short-title filter.

### AC-005

Given an entry containing six valid title words, the entry qualifies for the long-title filter.

### AC-006

The long-title filter returns only entries containing more than five words.

### AC-007

Long-title results are ordered from highest to lowest comment count.

### AC-008

The short-title filter returns only entries containing five or fewer words.

### AC-009

Short-title results are ordered from highest to lowest points.

### AC-010

Executing either filter creates a usage record containing at least:

- timestamp
- filter identifier

### AC-011

Filtering does not modify the original entry collection.

### AC-012

Automated tests verify the primary filtering, sorting, and word-counting behavior.

### AC-013

TypeScript type checking completes successfully.

### AC-014

ESLint completes successfully.

### AC-015

The complete automated test suite passes.

---

## 14. Success Criteria

The project is considered successful when:

- Hacker News data is correctly retrieved and parsed.
- The first 30 entries are represented consistently.
- Both filters produce correct results.
- Word counting follows the challenge definition.
- Usage information is persisted.
- Business rules have automated tests.
- TypeScript and ESLint checks pass.
- Important design decisions are documented.
- The repository contains a clear README explaining installation, execution, testing, and architecture.

---

## 15. Next Phase

No implementation decisions should be made from this document alone.

The next artifact must be:

```text
docs/SPEC.md

```

The Specification Agent will convert each functional requirement into precise technical behavior and test scenarios before implementation begins.

READY_FOR_SPECIFICATION: YES