export const ALLOWED_FILTERS = [
    "LONG_TITLE_BY_COMMENTS",
    "SHORT_TITLE_BY_POINTS",
  ] as const;
  
  export type FilterType = (typeof ALLOWED_FILTERS)[number];
  
  export function isFilterType(value: unknown): value is FilterType {
    return (
      typeof value === "string" &&
      ALLOWED_FILTERS.includes(value as FilterType)
    );
  }