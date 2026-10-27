import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";

import { formatRelativeTime } from "@/lib/format";
import { storyLinks } from "@/lib/hn/client";
import { type CommentNode, getCommentTree } from "@/lib/hn/comments";
import type { HNItem } from "@/lib/hn/types";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

/** `params` can't be read inside `"use cache"`, so the page passes the ID in. */
async function getThread(storyId: number) {
  "use cache";
  // Regenerated in the background every 5 minutes, like the feeds.
  cacheLife({ stale: 300, revalidate: 300, expire: 3600 });

  const tree = await getCommentTree(storyId);
  // Captured inside the cache scope so relative times match the cached render.
  return tree && { ...tree, now: new Date() };
}

/** HN can omit a title; the heading and the tab title fall back together. */
const storyTitle = (story: HNItem) => story.title ?? "Story";

async function getThreadOrNotFound(params: PageProps<"/story/[id]">["params"]) {
  const { id } = await params;
  const thread = /^\d+$/.test(id) ? await getThread(Number(id)) : null;
  if (!thread) notFound();
  return thread;
}

export async function generateMetadata({
  params,
}: PageProps<"/story/[id]">): Promise<Metadata> {
  const { story } = await getThreadOrNotFound(params);
  return { title: `${storyTitle(story)} · Tech News` };
}

function countComments(comments: CommentNode[]): number {
  return comments.reduce(
    (total, comment) => total + 1 + countComments(comment.replies),
    0,
  );
}

function Comment({ comment, now }: { comment: CommentNode; now: Date }) {
  return (
    <li>
      <details open>
        <summary className="cursor-pointer text-muted-foreground">
          <span className="font-medium text-foreground">{comment.author}</span>{" "}
          ·{" "}
          <time dateTime={comment.publishedAt.toISOString()}>
            {formatRelativeTime(comment.publishedAt, now)}
          </time>
        </summary>
        <p className="mt-1 whitespace-pre-wrap">{comment.text}</p>
        {comment.replies.length > 0 && (
          <ul className="mt-3 flex flex-col gap-3 border-l pl-4">
            {comment.replies.map((reply) => (
              <Comment key={reply.id} comment={reply} now={now} />
            ))}
          </ul>
        )}
      </details>
    </li>
  );
}

export default async function StoryPage({ params }: PageProps<"/story/[id]">) {
  const { story, comments, now } = await getThreadOrNotFound(params);
  const { url, domain, commentsUrl } = storyLinks(story.id, story.url);
  const shown = countComments(comments);
  const total = story.descendants ?? shown;

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">
          <a href={url} {...external} className="hover:underline">
            {storyTitle(story)}
          </a>
        </h1>
        <p className="text-muted-foreground">
          {domain && <>{domain} · </>}
          {story.score ?? 0} points{story.by && ` by ${story.by}`} ·{" "}
          <time dateTime={new Date(story.time * 1000).toISOString()}>
            {formatRelativeTime(new Date(story.time * 1000), now)}
          </time>
        </p>
      </header>

      {comments.length === 0 ? (
        <p className="text-muted-foreground">
          {total > 0 ? "No comments to show here." : "No comments yet."}
        </p>
      ) : (
        <ul aria-label="Comments" className="flex flex-col gap-4">
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} now={now} />
          ))}
        </ul>
      )}

      {total > shown && (
        <p>
          <a href={commentsUrl} {...external} className="hover:underline">
            Read the full discussion on Hacker News ({total} comments)
          </a>
        </p>
      )}
    </article>
  );
}
