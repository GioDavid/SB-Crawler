import { Router } from "express";

import { runHackerNewsFilter } from "../application/hacker-news-service.js";
import {
  isFilterType,
  type FilterType,
} from "../domain/filter-type.js";

import type {
  ApiErrorResponse,
  EntriesQuery,
  EntriesSuccessResponse,
} from "../http/types/entries-api.js";

export const entriesRouter = Router();

entriesRouter.get<
  Record<string, never>,
  EntriesSuccessResponse | ApiErrorResponse,
  Record<string, never>,
  EntriesQuery
>("/", async (req, res) => {
  try {
    const filter = req.query.filter;
    const pages = Number(req.query.pages ?? "1");


    if (!isFilterType(filter)) {
      return res.status(400).json({
        error:
          "Invalid filter. Use LONG_TITLE_BY_COMMENTS or SHORT_TITLE_BY_POINTS",
      });
    }

    if (
      !Number.isInteger(pages) ||
      pages < 1 ||
      pages > 30
    ) {
      return res.status(400).json({
        error: "pages must be an integer between 1 and 10",
      });
    }
    
    const entries = await runHackerNewsFilter(
      filter,
      pages,
    );

    return res.status(200).json({
      count: entries.length,
      entries,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    console.error(`Crawler failed: ${message}`);

    return res.status(500).json({
      error: "Unable to retrieve Hacker News entries",
    });
  }
});