import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_COUNT = 4;

/** Mirrors the story page's header and comment list so nothing shifts on load. */
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading story"
      className="flex flex-col gap-6"
    >
      <div aria-hidden="true" className="flex flex-col gap-2">
        <Skeleton className="h-7 w-4/5" />
        <Skeleton className="h-5 w-3/5" />
      </div>
      <ul aria-hidden="true" className="flex flex-col gap-4">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <li key={i} className="flex flex-col gap-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-5 w-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
