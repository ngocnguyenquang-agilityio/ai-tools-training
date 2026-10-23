/** Raw item shape returned by the Hacker News Firebase API. */
export type HNItem = {
  id: number;
  type: "job" | "story" | "comment" | "poll" | "pollopt";
  by?: string;
  /** Creation time in unix seconds. */
  time: number;
  title?: string;
  url?: string;
  score?: number;
  descendants?: number;
  deleted?: boolean;
  dead?: boolean;
};

export type Feed = "top" | "new" | "best";

/** A keyword search, or every story linking to one site. */
export type SearchQuery = { q: string } | { site: string };

export type SearchSort = "relevance" | "date";

/** Normalized story shape consumed by the UI. */
export type Story = {
  id: number;
  title: string;
  /** External URL, or the HN item URL for text posts (Ask HN, etc.). */
  url: string;
  domain: string | null;
  author: string;
  score: number;
  commentsCount: number;
  publishedAt: Date;
  commentsUrl: string;
};
