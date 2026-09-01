import { FilterType } from "../../domain/filter-type.js";
import type { HackerNewsEntry } from "../../domain/hacker-news-entry.js";

export interface EntriesQuery {
  filter?: FilterType;
  pages?: string;
}

export interface EntriesSuccessResponse {
  count: number;
  entries: HackerNewsEntry[];
}

export interface ApiErrorResponse {
  error: string;
}