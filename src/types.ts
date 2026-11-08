export interface SnapshotDay {
  /** Wayback timestamp, e.g. 20050101091102 */
  timestamp: string;
  /** YYYY-MM-DD */
  date: string;
  /** epoch ms (UTC) */
  epoch: number;
}

export interface YearBucket {
  year: number;
  /** Number of distinct archived days in this year */
  days: number;
  first: SnapshotDay | null;
  last: SnapshotDay | null;
  /** true when the CDX query for this year failed and the bucket is unverified */
  failed?: boolean;
}

export interface SiteHistory {
  domain: string;
  /** Normalized absolute URL used for queries */
  queryUrl: string;
  earliest: SnapshotDay | null;
  latest: SnapshotDay | null;
  years: YearBucket[];
  /** sum of days across fetched years */
  totalDays: number;
  fetchedAt: number;
  /** number of years whose data has been resolved */
  resolvedYears: number;
  totalYears: number;
}

export interface CdxRow {
  timestamp: string;
}

export type FetchedYears = Record<number, YearBucket>;

export interface CuratedSite {
  domain: string;
  name: string;
  zhName?: string;
  blurbZh: string;
  blurbEn: string;
  era: EraId;
  accent?: string;
}

export type EraId =
  | 'dawn'
  | 'portal'
  | 'web2'
  | 'mobile'
  | 'platform'
  | 'ai';

export interface Era {
  id: EraId;
  rangeZh: string;
  rangeEn: string;
  range: [number, number];
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  facts: EraFact[];
  sites: string[];
}

export interface EraFact {
  year: string;
  zh: string;
  en: string;
  source: string;
}

export interface SiteMeta {
  domain: string;
  earliest: string | null;
  latest: string | null;
  totalDays: number;
  years: { year: number; days: number; first: string | null; last: string | null }[];
}

export interface SiteMetaFile {
  generatedAt: string;
  source: string;
  sites: Record<string, SiteMeta>;
}