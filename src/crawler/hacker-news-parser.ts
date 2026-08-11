import * as cheerio from 'cheerio';
import type { HackerNewsEntry } from '../domain/hacker-news-entry.js';

export function parseHackerNewsEntries(
  html: string,
): HackerNewsEntry[] {
  const $ = cheerio.load(html);
  const entries: HackerNewsEntry[] = [];

  $('.athing')
    .slice(0, 30)
    .each((_, element) => {
      const row = $(element);
      const subtextRow = row.next();

      const numberText = row.find('.rank').text().trim();

      const title = row
        .find('.titleline > a')
        .first()
        .text()
        .trim();

      const pointsText = subtextRow
        .find('.score')
        .text()
        .trim();

      const commentsText = subtextRow
        .find('a')
        .filter((_, link) => {
          const text = $(link).text().trim();

          return (
            text.includes('comment') ||
            text === 'discuss'
          );
        })
        .last()
        .text()
        .trim();

      const number =
        Number.parseInt(numberText, 10) || 0;

      const points =
        Number.parseInt(pointsText, 10) || 0;

      const comments =
        Number.parseInt(commentsText, 10) || 0;

      entries.push({
        number,
        title,
        points,
        comments,
      });
    });

  return entries;
}