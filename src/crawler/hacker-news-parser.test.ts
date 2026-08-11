import { describe, expect, it } from "vitest";
import { parseHackerNewsEntries } from "./hacker-news-parser.js";

describe("parseHackerNewsEntries", () => {
  const hackerNewsHtml = `
    <table>
      <tr class="athing" id="1">
        <td class="title">
          <span class="rank">1.</span>
        </td>
        <td class="title">
          <span class="titleline">
            <a href="https://example.com/1">Title one</a>
          </span>
        </td>
      </tr>
      <tr>
        <td colspan="2"></td>
        <td class="subtext">
          <span class="score">10 points</span>
          <a href="item?id=1">5 comments</a>
        </td>
      </tr>

      <tr class="athing" id="2">
        <td class="title">
          <span class="rank">2.</span>
        </td>
        <td class="title">
          <span class="titleline">
            <a href="https://example.com/2">
              Title two with a longer description
            </a>
          </span>
        </td>
      </tr>
      <tr>
        <td colspan="2"></td>
        <td class="subtext">
          <span class="score">100 points</span>
          <a href="item?id=2">10 comments</a>
        </td>
      </tr>
    </table>
  `;

  it("parses number", () => {
    const entries = parseHackerNewsEntries(hackerNewsHtml);

    expect(entries[0]?.number).toBe(1);
    expect(entries[1]?.number).toBe(2);
  });

  it("parses title", () => {
    const entries = parseHackerNewsEntries(hackerNewsHtml);

    expect(entries[0]?.title).toBe("Title one");

    expect(entries[1]?.title).toBe("Title two with a longer description");
  });

  it("parses points", () => {
    const entries = parseHackerNewsEntries(hackerNewsHtml);

    expect(entries[0]?.points).toBe(10);
    expect(entries[1]?.points).toBe(100);
  });

  it("parses comments", () => {
    const entries = parseHackerNewsEntries(hackerNewsHtml);

    expect(entries[0]?.comments).toBe(5);
    expect(entries[1]?.comments).toBe(10);
  });

  it("normalizes missing points to 0", () => {
    const html = `
      <table>
        <tr class="athing">
          <td class="title">
            <span class="rank">1.</span>
          </td>
          <td class="title">
            <span class="titleline">
              <a href="https://example.com">Title one</a>
            </span>
          </td>
        </tr>
        <tr>
          <td colspan="2"></td>
          <td class="subtext">
            <a href="item?id=1">5 comments</a>
          </td>
        </tr>
      </table>
    `;

    const entries = parseHackerNewsEntries(html);

    expect(entries[0]?.points).toBe(0);
  });

  it("normalizes discuss to 0 comments", () => {
    const html = `
      <table>
        <tr class="athing">
          <td class="title">
            <span class="rank">1.</span>
          </td>
          <td class="title">
            <span class="titleline">
              <a href="https://example.com">Title one</a>
            </span>
          </td>
        </tr>
        <tr>
          <td colspan="2"></td>
          <td class="subtext">
            <span class="score">10 points</span>
            <a href="item?id=1">discuss</a>
          </td>
        </tr>
      </table>
    `;

    const entries = parseHackerNewsEntries(html);

    expect(entries[0]?.comments).toBe(0);
  });

  it("returns no more than 30 entries", () => {
    const rows = Array.from(
      { length: 31 },
      (_, index) => `
        <tr class="athing">
          <td class="title">
            <span class="rank">${index + 1}.</span>
          </td>
          <td class="title">
            <span class="titleline">
              <a href="https://example.com/${index + 1}">
                Title ${index + 1}
              </a>
            </span>
          </td>
        </tr>
        <tr>
          <td colspan="2"></td>
          <td class="subtext">
            <span class="score">${index + 1} points</span>
            <a href="item?id=${index + 1}">
              ${index + 1} comments
            </a>
          </td>
        </tr>
      `,
    ).join("");

    const entries = parseHackerNewsEntries(`<table>${rows}</table>`);

    expect(entries).toHaveLength(30);
    expect(entries[0]?.number).toBe(1);
    expect(entries[29]?.number).toBe(30);
  });

  it("returns an empty array for HTML without Hacker News entries", () => {
    expect(parseHackerNewsEntries("<html><body></body></html>")).toEqual([]);
  });
});
