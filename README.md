# Hacker News Crawler

A small TypeScript application that scrapes the first 30 entries from Hacker News and provides filtering and sorting operations based on title word count, comments, and points.

The project was developed using a specification-driven and AI-assisted workflow with Ollama, while keeping implementation decisions, validation, and testing explicit and reviewable.

## Features

The crawler extracts the first 30 entries from Hacker News:

- Entry number

- Title

- Points

- Number of comments

It supports two filtering operations:

### Long titles

Returns entries whose titles contain more than 5 words.

Results are ordered by number of comments in descending order.

```text

title words > 5

→ sort by comments DESC

```

### Short titles

Returns entries whose titles contain 5 words or fewer.

Results are ordered by points in descending order.

```text

title words <= 5

→ sort by points DESC

```

The application also stores usage information for each filter execution, including:

- Timestamp

- Applied filter

---

## Tech Stack

- TypeScript

- Node.js

- Cheerio

- Vitest

- ESLint

- tsx

The application uses the native Node.js `fetch` API, so an additional HTTP client such as Axios is not required.

---

## Project Structure

```text

src/

├── application/

│   ├── hacker-news-service.ts

│   └── hacker-news-service.test.ts

│

├── crawler/

│   ├── hacker-news-client.ts

│   ├── hacker-news-client.test.ts

│   ├── hacker-news-parser.ts

│   └── hacker-news-parser.test.ts

│

├── domain/

│   ├── hacker-news-entry.ts

│   └── usage-record.ts

│

├── filters/

│   ├── count-words.ts

│   ├── count-words.test.ts

│   ├── entry-filters.ts

│   └── entry-filters.test.ts

│

├── storage/

│   ├── usage-store.ts

│   └── usage-store.test.ts

│

└── index.ts

data/

└── usage.jsonl

docs/

├── [PRD.md](http://PRD.md)

├── [SPEC.md](http://SPEC.md)

├── [ARCHITECTURE.md](http://ARCHITECTURE.md)

└── IMPLEMENTATION_[PLAN.md](http://PLAN.md)

.cursor/

├── agents/

└── rules/

scripts/

├── [run-agent.sh](http://run-agent.sh)

└── [run-implementation.sh](http://run-implementation.sh)

```

---

## Architecture

The application separates network access, parsing, business rules, persistence, and orchestration.

```text

Hacker News

     │

     ▼

HTTP Client

     │

     ▼

HTML Parser

     │

     ▼

HackerNewsEntry[]

     │

     ▼

Filtering / Sorting

     │

     ├──────────────► Usage Tracking

     │

     ▼

Filtered Results

```

### HTTP Client

`hacker-news-client.ts`

Responsible only for retrieving the Hacker News HTML using native `fetch`.

It does not contain parsing or filtering logic.

### Parser

`hacker-news-parser.ts`

Uses Cheerio to transform Hacker News HTML into domain objects.

```ts

HackerNewsEntry {

  number

  title

  points

  comments

}

```

Only the first 30 entries are returned.

Missing points and comments are normalized to `0`.

### Filters

`entry-filters.ts`

Contains the business rules for the two required filtering operations.

The filtering implementation reuses the centralized word-counting logic instead of duplicating it.

### Application Service

`hacker-news-service.ts`

Orchestrates the complete operation:

```text

fetch

→ parse

→ filter

→ persist usage

→ return results

```

### Storage

`usage-store.ts`

Stores usage records using JSON Lines.

Each execution appends one record to:

```text

data/usage.jsonl

```

Example:

```json

{"timestamp":"2026-08-11T01:30:00.000Z","filter":"LONG_TITLE_BY_COMMENTS"}

{"timestamp":"2026-08-11T01:31:00.000Z","filter":"SHORT_TITLE_BY_POINTS"}

```

JSONL was chosen because the challenge requires lightweight usage persistence and does not require the operational complexity of a database.

---

## Installation

Requirements:

- Node.js

- npm

Install dependencies:

```bash

npm install

```

---

## Running the Application

Two filters are available.

### Titles with more than 5 words

```bash

npm start -- LONG_TITLE_BY_COMMENTS

```

This:

1. Downloads Hacker News.

2. Extracts the first 30 entries.

3. Keeps entries with titles containing more than 5 words.

4. Sorts them by comments descending.

5. Stores the usage event.

6. Prints the results.

### Titles with 5 words or fewer

```bash

npm start -- SHORT_TITLE_BY_POINTS

```

This:

1. Downloads Hacker News.

2. Extracts the first 30 entries.

3. Keeps entries with titles containing 5 words or fewer.

4. Sorts them by points descending.

5. Stores the usage event.

6. Prints the results.

---

## Word Counting

Word counting follows the requirements of the challenge.

Words are determined from spaced tokens while standalone symbols are ignored.

For example:

```text

This is - a self-explained example

```

is counted as:

```text

This

is

a

self-explained

example

```

Result:

```text

5 words

```

The word-counting behavior is isolated in:

```text

src/filters/count-words.ts

```

This makes the rule independently testable and prevents the filtering functions from duplicating the logic.

---

## Testing

Run all tests:

```bash

npm test

```

The test suite covers the main application layers independently.

Examples include:

- Word-counting rules

- Symbols in titles

- Five-word boundary

- Long-title filtering

- Short-title filtering

- Sorting by comments

- Sorting by points

- Hacker News HTML parsing

- Missing points

- Missing comments

- Maximum of 30 entries

- HTTP failures

- Network failures

- Usage persistence

- Application orchestration

Network requests are mocked in unit tests so the test suite does not depend on Hacker News availability.

Parser tests use supplied HTML instead of making real HTTP requests.

---

## Code Quality

Run TypeScript validation:

```bash

npm run typecheck

```

Run ESLint:

```bash

npm run lint

```

Run tests:

```bash

npm test

```

Build the project:

```bash

npm run build

```

Before submission, the complete quality gate can be executed with:

```bash

npm run typecheck

npm run lint

npm test

npm run build

```

---

## Design Decisions

### Separation of responsibilities

Fetching, parsing, filtering, persistence, and orchestration are separate modules.

This makes each behavior easier to understand, test, and replace.

### Native fetch

Node.js native `fetch` is used instead of adding another HTTP dependency.

### Cheerio for HTML parsing

Cheerio provides a lightweight way to query the Hacker News HTML structure using familiar selectors.

### JSONL persistence

A full database would add unnecessary complexity for the requirements of this challenge.

JSONL provides:

- Persistent usage history

- Append-only writes

- Human-readable data

- Minimal infrastructure

### Dependency injection through module boundaries

Network and persistence behavior are isolated from business logic, allowing tests to mock external side effects.

### Immutable filtering

Filtering operations avoid modifying the original entries collection.

### Explicit domain models

The application uses TypeScript domain types for crawler entries and usage records, keeping boundaries explicit and type-safe.

---

## Error Handling

The HTTP client checks the response status before processing the response.

For example:

```text

Failed to fetch Hacker News: HTTP 500

```

Network errors are propagated to the application entry point, which reports the failure and exits with a non-zero status.

---

## Specification-Driven Development

Development started from requirements rather than directly generating implementation code.

The workflow was:

```text

Challenge Requirements

        ↓

PRD

        ↓

Specification

        ↓

Architecture

        ↓

Implementation Plan

        ↓

Small Implementation Tasks

        ↓

Automated Validation

```

Supporting documents are available under:

```text

docs/

```

This makes the reasoning behind the implementation visible rather than leaving it implicit in the source code.

---

## AI-Assisted Development

AI was used as an engineering assistant during development through local Ollama models.

The workflow used specialized responsibilities such as:

```text

Product Agent

     ↓

PRD

Specification Agent

     ↓

SPEC

Architecture Agent

     ↓

ARCHITECTURE

Planning Agent

     ↓

IMPLEMENTATION_PLAN

Implementation Agent

     ↓

small scoped code changes

```

Project-level engineering and workflow rules were also provided to the agents.

Implementation was intentionally divided into small tasks rather than asking the model to generate the entire application at once.

Each generated change was validated using deterministic tooling:

```text

AI-generated proposal

        ↓

TypeScript compiler

        ↓

ESLint

        ↓

Vitest

        ↓

Human review

```

The AI therefore assisted with implementation but was not treated as the source of truth.

The specification, compiler, lint rules, tests, and human review remained the validation boundaries.

---

## Development Principles

The project intentionally favors:

- Small focused modules

- Explicit TypeScript types

- Separation of concerns

- Minimal dependencies

- Reusable business logic

- Deterministic tests

- No network dependency in unit tests

- Incremental implementation

- Automated quality gates

- Reviewable AI-generated changes

The goal is to keep the solution appropriate for the size of the challenge without introducing unnecessary infrastructure or abstractions.

---

## Available Commands

```bash

# Install dependencies

npm install

# Long titles ordered by comments

npm start -- LONG_TITLE_BY_COMMENTS

# Short titles ordered by points

npm start -- SHORT_TITLE_BY_POINTS

# TypeScript validation

npm run typecheck

# Lint

npm run lint

# Tests

npm test

# Build

npm run build

```

---

## Final Verification

Before submitting the project:

```bash

npm run typecheck

npm run lint

npm test

npm run build

```

Then verify both real crawler operations:

```bash

npm start -- LONG_TITLE_BY_COMMENTS

npm start -- SHORT_TITLE_BY_POINTS

```

And inspect persisted usage:

```bash

cat data/usage.jsonl

```