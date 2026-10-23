import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format";
import type { Story } from "@/lib/hn/types";
import { isSearchableSite, searchHref } from "@/lib/search-params";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

const plural = (count: number, word: string) =>
  `${count} ${count === 1 ? word : `${word}s`}`;

type NewsCardProps = {
  story: Story;
  /** Reference time for the relative timestamp; pass one value for a whole list. */
  now?: Date;
};

export function NewsCard({ story, now }: NewsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>
            <a href={story.url} {...external} className="hover:underline">
              {story.title}
            </a>
          </h2>
        </CardTitle>
        {story.domain && (
          <CardAction>
            {isSearchableSite(story.domain) ? (
              <Badge
                variant="secondary"
                // The variant's hover background barely shifts on a card, so
                // underline like the card's other links.
                className="hover:underline"
                render={
                  <Link
                    href={searchHref({ site: story.domain })}
                    aria-label={`More stories from ${story.domain}`}
                  />
                }
              >
                {story.domain}
              </Badge>
            ) : (
              <Badge variant="secondary">{story.domain}</Badge>
            )}
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-x-1 text-muted-foreground">
        <span>{plural(story.score, "point")}</span>
        <span>by {story.author}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={story.publishedAt.toISOString()}>
          {formatRelativeTime(story.publishedAt, now)}
        </time>
        <span aria-hidden="true">·</span>
        <a href={story.commentsUrl} {...external} className="hover:underline">
          {plural(story.commentsCount, "comment")}
        </a>
      </CardContent>
    </Card>
  );
}
