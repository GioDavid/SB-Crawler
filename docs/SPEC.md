# SPEC.md

## 1. Fetch Hacker News

**Related requirement:** FR-001 — Retrieve Hacker News

**Behavior:**
- Send an HTTP request to `https://news.ycombinator.com/`.
- Handle network failures by catching and logging errors.

**Key edge cases:**
- Network requests may fail due to internet issues.
- Responses might be malformed or incomplete.

**Expected tests:**
1. **Network Failure Handling:** Test that the application handles a failed[6D[K
failed request gracefully.
2. **Response Parsing:** Verify that valid HTML is parsed correctly without[7D[K
without missing any required data points.

## 2. Parse the first 30 entries

**Related requirement:** FR-002 — Extract First 30 Entries

**Behavior:**
- Use Cheerio to parse the HTML content of the response.
- Locate and extract entry elements using their class or ID attributes.
- Ensure only the first 30 entries are processed.

**Key edge cases:**
- The API might return less than 30 valid entries.
- Entries might be missing certain data points (e.g., title, points).

**Expected tests:**
1. **Entry Extraction:** Verify that the function extracts all required fie[3D[K
fields from the correct number of entries.
2. **Edge Case Handling:** Ensure the function handles cases with fewer tha[3D[K
than 30 entries gracefully.

## 3. Normalize number, title, points and comments

**Related requirement:** FR-004 — Extract Title, FR-005 — Extract Points, F[1D[K
FR-006 — Extract Comments

**Behavior:**
- Convert extracted strings to numbers or null for missing values.
- Handle invalid inputs gracefully by providing default values (e.g., 0 for[3D[K
for points and comments).

**Key edge cases:**
- Entries might contain numeric data that cannot be converted to a number.
- Some entries might not contain all required fields.

**Expected tests:**
1. **Normalization:** Verify that the function converts strings to numbers [K
where possible, handling missing values gracefully.
2. **Error Handling:** Ensure the function handles invalid input and provid[6D[K
provides default values when necessary.

## 4. Handle missing points/comments

**Related requirement:** FR-005 — Extract Points, FR-006 — Extract Comments[8D[K
Comments

**Behavior:**
- Replace missing point and comment data with zero or an appropriate placeh[6D[K
placeholder.
- Handle cases where comments are represented as 'discuss' by converting th[2D[K
them to zero.

**Key edge cases:**
- Entries might be missing points entirely.
- Comments might be represented as a string, such as 'discuss'.

**Expected tests:**
1. **Missing Points/Comments:** Verify that the function correctly handles [K
entries with missing point and comment data.
2. **Discuss Conversion:** Ensure that entries with comments represented as[2D[K
as 'discuss' are handled correctly.

## 5. Count title words

**Related requirement:** FR-007 — Count Title Words

**Behavior:**
- Split the title by whitespace and count non-empty tokens.
- Ignore standalone symbols and hyphenated words.

**Key edge cases:**
- Titles might contain multiple spaces or be empty.
- Titles might include hyphens that are not treated as word separators.

**Expected tests:**
1. **Word Counting:** Verify that the function correctly counts valid words[5D[K
words in a title.
2. **Hyphenated Words:** Ensure that hyphenated words are counted as one to[2D[K
token.

## 6. Long-title by comments

**Related requirement:** FR-004 — Extract Title, FR-008 — Long-Titles by Co[2D[K
Comments

**Behavior:**
- Select titles with more than five words and sort them in descending order[5D[K
order of comment count.
- Use `LONG_TITLE_BY_COMMENTS` as the filter identifier.

**Key edge cases:**
- Titles might have exactly five words.
- Entries might be missing comments or contain negative numbers.

**Expected tests:**
1. **Long Title Selection:** Verify that titles with more than five words a[1D[K
are correctly selected and sorted.
2. **Filter Identifier:** Ensure that the filter identifier is used as expe[4D[K
expected in the usage record.

## 7. Short-title by points

**Related requirement:** FR-004 — Extract Title, FR-009 — Short-Titles by P[1D[K
Points

**Behavior:**
- Select titles with five or fewer words and sort them in descending order [K
of points.
- Use `SHORT_TITLE_BY_POINTS` as the filter identifier.

**Key edge cases:**
- Titles might have exactly five words.
- Entries might be missing points or contain negative numbers.

**Expected tests:**
1. **Short Title Selection:** Verify that titles with five or fewer words a[1D[K
are correctly selected and sorted.
2. **Filter Identifier:** Ensure that the filter identifier is used as expe[4D[K
expected in the usage record.

## 8. Usage record creation

**Related requirement:** FR-004 — Extract Title, FR-005 — Extract Points, F[1D[K
FR-006 — Extract Comments

**Behavior:**
- Record the timestamp and filter identifier when a title meets certain cri[3D[K
criteria (long-title or short-title).
- Use `LONG_TITLE_BY_COMMENTS` for titles with more than five words and `SH[3D[K
`SHORT_TITLE_BY_POINTS` for titles with five or fewer words.

**Key edge cases:**
- Titles might have exactly five words.
- Entries might be missing points or comments.

**Expected tests:**
1. **Usage Record Creation:** Verify that a usage record is created when th[2D[K
the conditions for a filter are met.
2. **Filter Identifier:** Ensure that the correct filter identifier is used[4D[K
used in the usage record.

## 9. Data representation

**Related requirement:** FR-004 — Extract Title, FR-005 — Extract Points, F[1D[K
FR-006 — Extract Comments

**Behavior:**
- Represent each entry as a `HackerNewsEntry` object with properties for `n[2D[K
`number`, `title`, `points`, and `comments`.
- Ensure all required fields are present and correctly parsed.

**Key edge cases:**
- Entries might be missing some data points.
- The parser should handle errors gracefully by providing default values or[2D[K
or nulls.

**Expected tests:**
1. **Data Representation:** Verify that each entry is correctly represented[11D[K
represented as a `HackerNewsEntry` object.
2. **Error Handling:** Ensure that the parser handles missing data points a[1D[K
and provides default values when necessary.

## 10. Performance optimization

**Related requirement:** NFR-004 — Performance

**Behavior:**
- Avoid unnecessary requests to the Hacker News API.
- Reuse a parsed dataset across multiple filter operations if possible.
- Use efficient sorting algorithms for handling small collections of entrie[6D[K
entries (e.g., quicksort).

**Key edge cases:**
- Multiple filter operations might be performed sequentially.
- The crawler should efficiently handle responses with fewer than 30 valid [K
entries.

**Expected tests:**
1. **Performance Optimization:** Verify that the application handles multip[6D[K
multiple filter operations efficiently.
2. **Resource Usage:** Ensure that resource usage is minimal, especially wh[2D[K
when processing a small number of entries.

## 11. Edge case handling

**Related requirement:** AC-006 — The long-title filter returns only entrie[6D[K
entries containing more than five words, AC-008 — The short-title filter re[2D[K
returns only entries containing five or fewer words

**Behavior:**
- Handle cases where titles have exactly five valid words separately.
- Ensure that the long-title and short-title filters return expected result[6D[K
results for different word counts.

**Key edge cases:**
- Titles might have exactly five words.
- Entries might be missing points or comments.

**Expected tests:**
1. **Exact Five Words Handling:** Verify that titles with exactly five word[4D[K
words are handled correctly by both filters.
2. **Edge Case Filtering:** Ensure that the long-title and short-title filt[4D[K
filters return expected results for different word counts.

## 12. Type safety

**Related requirement:** NFR-001 — Type Safety

**Behavior:**
- Use TypeScript to define types for `HackerNewsEntry` and ensure all requi[5D[K
required fields are present.
- Avoid unnecessary use of `any` in the codebase.

**Key edge cases:**
- Incorrect types might be assigned to `HackerNewsEntry` properties.
- The parser should handle errors gracefully by providing default values or[2D[K
or nulls.

**Expected tests:**
1. **Type Safety:** Verify that all required fields are present and correct[7D[K
correctly typed in a `HackerNewsEntry`.
2. **Error Handling:** Ensure that the parser handles incorrect types grace[5D[K
gracefully by providing default values when necessary.

## READY_FOR_SPECIFICATION: YES

