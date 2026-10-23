import Anthropic from "@anthropic-ai/sdk";

import { getTldr, TldrFailedError } from "@/lib/ai/tldr";
import { isOnAFeed } from "@/lib/hn/feed-ids";

const error = (status: number, message: string) =>
  Response.json({ error: message }, { status });

/**
 * `GET /api/tldr/<storyId>` → `{ bullets: string[] }`. The Claude call stays on
 * the server, so the API key never reaches the browser.
 * (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md)
 */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/tldr/[id]">,
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

  // The route is public, so only stories the app lists can cost a Claude
  // call; a script can't walk every story ID on HN.
  let onFeed: boolean;
  try {
    onFeed = await isOnAFeed(storyId);
  } catch (cause) {
    console.error(`TL;DR feed check for story ${storyId} failed:`, cause);
    return error(502, "Couldn't summarize this discussion");
  }
  if (!onFeed) {
    return error(403, "Summaries are only for stories on the feeds");
  }

  try {
    const tldr = await getTldr(storyId);
    if (!tldr) return error(404, "Story not found");
    return Response.json(tldr);
  } catch (cause) {
    if (
      cause instanceof TldrFailedError ||
      cause instanceof Anthropic.APIError
    ) {
      console.error(`TL;DR for story ${storyId} failed:`, cause.message);
      return error(502, "Couldn't summarize this discussion");
    }
    throw cause;
  }
}
