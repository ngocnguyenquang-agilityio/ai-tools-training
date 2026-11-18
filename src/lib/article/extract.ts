import "server-only";

import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

/** Enough for a summary, and bounds what one article can cost in tokens. */
export const MAX_ARTICLE_CHARS = 20_000;

/** Below this there's no article to speak of: a login wall, a JS-only shell. */
const MIN_ARTICLE_CHARS = 200;

export type ArticleText = { title: string; text: string };

/**
 * The readable text of an article page, or null when there's none. Readability
 * drops navigation, footers and scripts, the way a browser's reader view does.
 */
export function extractArticleText(html: string): ArticleText | null {
  let article;
  try {
    const { document } = parseHTML(html);
    article = new Readability(document as unknown as Document, {
      charThreshold: MIN_ARTICLE_CHARS,
    }).parse();
  } catch {
    // The page is arbitrary third-party HTML; a parser crash means unreadable.
    return null;
  }

  const text = (article?.textContent ?? "").replace(/\s+/g, " ").trim();
  if (text.length < MIN_ARTICLE_CHARS) return null;

  return {
    title: (article?.title ?? "").trim(),
    text: text.slice(0, MAX_ARTICLE_CHARS),
  };
}
