export type FilterType =
  | 'LONG_TITLE_BY_COMMENTS'
  | 'SHORT_TITLE_BY_POINTS';

export interface UsageRecord {
  timestamp: string;
  filter: FilterType;
}
