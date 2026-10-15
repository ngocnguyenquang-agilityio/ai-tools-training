import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_COUNT = 6;

/** Mirrors `NewsCard`'s layout so the page doesn't shift when stories stream in. */
function NewsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        {/* Heights match the text line-heights of the real title and meta line. */}
        <CardTitle>
          <Skeleton className="h-5.5 w-4/5" />
        </CardTitle>
        <CardAction>
          <Skeleton className="h-5 w-20 rounded-4xl" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-5 w-3/5" />
      </CardContent>
    </Card>
  );
}

export default function Loading() {
  return (
    <div role="status" aria-label="Loading stories">
      <ol aria-hidden="true" className="flex flex-col gap-4">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <li key={i}>
            <NewsCardSkeleton />
          </li>
        ))}
      </ol>
    </div>
  );
}
