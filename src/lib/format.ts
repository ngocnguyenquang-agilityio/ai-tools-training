const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Fixed locale so server and client render the same string (no hydration mismatch).
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" });

/** Formats a past date relative to `now`, e.g. "5 minutes ago". */
export function formatRelativeTime(date: Date, now = new Date()): string {
  // Clamp future dates (clock skew) to "0 seconds ago".
  const seconds = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 1000),
  );

  if (seconds < MINUTE) return rtf.format(-seconds, "second");
  if (seconds < HOUR)
    return rtf.format(-Math.floor(seconds / MINUTE), "minute");
  if (seconds < DAY) return rtf.format(-Math.floor(seconds / HOUR), "hour");
  return rtf.format(-Math.floor(seconds / DAY), "day");
}
