import Anthropic from "@anthropic-ai/sdk";

import {
  ArticleSummaryFailedError,
  getArticleSummary,
} from "@/lib/ai/article-summary";
import { isOnAFeed } from "@/lib/hn/feed-ids";

const error = (status: number, message: string) =>
  Response.json({ error: message }, { status });

/**
 * `GET /api/article-summary/<storyId>` → `{ summary: string }`. The server
 * fetches the story's own link and calls Claude, so the key never reaches the
 * browser and the client can't point the fetch at a URL of its own. No
 * `runtime` export: with Cache Components, Node.js is the only runtime
 * (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/runtime.md).
 */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/article-summary/[id]">,
) {
  const { id } = await ctx.params;
  // Digits only, like the page param parser: no "1e3", "0x10" or " 7 ".
  const storyId = /^\d+$/.test(id) ? Number(id) : NaN;
  if (!Number.isSafeInteger(storyId) || storyId < 1) {
    return error(400, "Invalid story ID");
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return error(503, "Summaries aren't set up on this server");
  }

  // The route is public, so only stories the app lists can trigger a fetch and
  // a Claude call; a script can't walk every story ID on HN.
  let onFeed: boolean;
  try {
    onFeed = await isOnAFeed(storyId);
  } catch (cause) {
    console.error(`Article feed check for story ${storyId} failed:`, cause);
    return error(502, "Couldn't summarize this article");
  }
  if (!onFeed) {
    return error(403, "Summaries are only for stories on the feeds");
  }

  try {
    const result = await getArticleSummary(storyId);
    if (!result) return error(404, "This story has no article to summarize");
    if (result.summary === null)
      return error(422, "Couldn't read this article");
    return Response.json({ summary: result.summary });
  } catch (cause) {
    if (
      cause instanceof ArticleSummaryFailedError ||
      cause instanceof Anthropic.APIError
    ) {
      console.error(
        `Article summary for story ${storyId} failed:`,
        cause.message,
      );
      return error(502, "Couldn't summarize this article");
    }
    throw cause;
  }
}
