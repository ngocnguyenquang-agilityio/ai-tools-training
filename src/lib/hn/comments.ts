import { getItem, isLiveStory } from "./client";
import type { HNItem } from "./types";

export type ThreadComment = {
  /** Plain text, HTML stripped. */
  text: string;
  /** 1 for a top-level comment, 2 for a reply to one, and so on. */
  depth: number;
};

export type ThreadSample = {
  story: HNItem;
  comments: ThreadComment[];
  /** Comment fetches that failed and were skipped; more may exist on a retry. */
  failed: number;
};

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

/** Turns HN's comment HTML (`<p>`, `<i>`, `<a>`, `<pre><code>`, entities) into plain text. */
export function htmlToText(html: string): string {
  return html
    .replace(/<p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
      if (entity[0] === "#") {
        const code =
          entity[1].toLowerCase() === "x"
            ? parseInt(entity.slice(2), 16)
            : parseInt(entity.slice(1), 10);
        // fromCodePoint throws past U+10FFFF, so keep such text as written.
        return code <= 0x10ffff ? String.fromCodePoint(code) : match;
      }
      return ENTITIES[entity.toLowerCase()] ?? match;
    })
    .trim();
}

function isLiveComment(item: HNItem | null): item is HNItem & { text: string } {
  return (
    item !== null &&
    item.type === "comment" &&
    !item.deleted &&
    !item.dead &&
    Boolean(item.text)
  );
}

/**
 * Samples a story's discussion breadth-first, one depth level at a time, in
 * HN's ranked order, so the top of each thread wins over deep sub-threads.
 * Returns null when the ID isn't a live story.
 */
export async function getThreadSample(
  storyId: number,
  {
    maxComments = 40,
    maxDepth = 2,
    maxChars = 12_000,
  }: { maxComments?: number; maxDepth?: number; maxChars?: number } = {},
): Promise<ThreadSample | null> {
  const story = await getItem(storyId);
  if (!isLiveStory(story)) return null;

  const comments: ThreadComment[] = [];
  let failed = 0;
  let chars = 0;
  let level = story.kids ?? [];

  for (let depth = 1; depth <= maxDepth && level.length > 0; depth++) {
    const batch = level.slice(0, maxComments - comments.length);
    // One failed comment fetch shouldn't sink the whole summary; skip it.
    const results = await Promise.allSettled(batch.map((id) => getItem(id)));
    const next: number[] = [];

    for (const result of results) {
      if (chars >= maxChars) break;
      if (result.status === "rejected") failed++;
      const item = result.status === "fulfilled" ? result.value : null;
      if (!isLiveComment(item)) continue;
      const text = htmlToText(item.text).slice(0, maxChars - chars);
      if (!text) continue;
      comments.push({ text, depth });
      chars += text.length;
      next.push(...(item.kids ?? []));
    }

    if (comments.length >= maxComments || chars >= maxChars) break;
    level = next;
  }

  return { story, comments, failed };
}

export type CommentNode = {
  id: number;
  author: string;
  publishedAt: Date;
  /** Plain text, HTML stripped. */
  text: string;
  replies: CommentNode[];
};

export type CommentTree = {
  story: HNItem;
  comments: CommentNode[];
};

/** A story's discussion as a nested tree, in HN's ranked order. */
export async function getCommentTree(
  storyId: number,
  {
    maxDepth = 3,
    maxComments = 100,
  }: { maxDepth?: number; maxComments?: number } = {},
): Promise<CommentTree | null> {
  const story = await getItem(storyId);
  if (!isLiveStory(story)) return null;

  const comments: CommentNode[] = [];
  let level = (story.kids ?? []).map((id) => ({ id, into: comments }));
  let count = 0;

  // Level by level, so the top of each thread wins over deep sub-threads.
  for (let depth = 1; depth <= maxDepth && level.length > 0; depth++) {
    level = level.slice(0, maxComments - count);
    // One failed comment fetch shouldn't sink the page; skip it.
    const results = await Promise.allSettled(
      level.map(({ id }) => getItem(id)),
    );
    const next: typeof level = [];

    results.forEach((result, index) => {
      const item = result.status === "fulfilled" ? result.value : null;
      // A skipped comment takes its replies with it: they would have no parent
      // to nest under.
      if (!isLiveComment(item)) return;
      const text = htmlToText(item.text);
      // Nothing left to show (markup only), so it is skipped like a dead one.
      if (!text) return;

      const node: CommentNode = {
        id: item.id,
        author: item.by ?? "",
        publishedAt: new Date(item.time * 1000),
        text,
        replies: [],
      };
      level[index].into.push(node);
      count++;
      next.push(...(item.kids ?? []).map((id) => ({ id, into: node.replies })));
    });
    level = next;
  }

  return { story, comments };
}
