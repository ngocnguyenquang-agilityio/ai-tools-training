import { formatRelativeTime } from "./format";

const now = new Date("2026-01-15T12:00:00Z");
const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000);

describe("formatRelativeTime", () => {
  it.each([
    [0, "0 seconds ago"],
    [1, "1 second ago"],
    [59, "59 seconds ago"],
    [60, "1 minute ago"],
    [5 * 60, "5 minutes ago"],
    [59 * 60 + 59, "59 minutes ago"],
    [60 * 60, "1 hour ago"],
    [3 * 60 * 60, "3 hours ago"],
    [23 * 60 * 60 + 59 * 60, "23 hours ago"],
    [24 * 60 * 60, "1 day ago"],
    [10 * 24 * 60 * 60, "10 days ago"],
  ])("formats %i seconds as %p", (seconds, expected) => {
    expect(formatRelativeTime(ago(seconds), now)).toBe(expected);
  });

  it("clamps future dates to 0 seconds ago", () => {
    expect(formatRelativeTime(ago(-30), now)).toBe("0 seconds ago");
  });

  it("defaults `now` to the current time", () => {
    expect(formatRelativeTime(new Date())).toBe("0 seconds ago");
  });
});
