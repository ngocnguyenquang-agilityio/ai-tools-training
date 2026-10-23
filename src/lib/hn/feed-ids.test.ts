/**
 * @jest-environment node
 */
import { getStoryIds } from "./client";
import { isOnAFeed } from "./feed-ids";
import type { Feed } from "./types";

jest.mock("next/cache", () => ({ cacheLife: jest.fn() }));
jest.mock("./client", () => ({ getStoryIds: jest.fn() }));

const mockGetStoryIds = jest.mocked(getStoryIds);

const feeds: Record<Feed, number[]> = {
  top: [1, 2],
  new: [3, 1],
  best: [4],
};

describe("isOnAFeed", () => {
  beforeEach(() => {
    mockGetStoryIds
      .mockReset()
      .mockImplementation(async (feed: Feed) => feeds[feed]);
  });

  it.each([
    ["Top", 2],
    ["New", 3],
    ["Best", 4],
  ])("is true for a story on %s", async (_, storyId) => {
    expect(await isOnAFeed(storyId)).toBe(true);
  });

  it("is false for a story on no feed, after checking all three", async () => {
    const onFeed = await isOnAFeed(99);

    expect(onFeed).toBe(false);
    expect(mockGetStoryIds.mock.calls.map(([feed]) => feed)).toEqual([
      "top",
      "new",
      "best",
    ]);
  });

  it("fails when a feed can't be loaded", async () => {
    mockGetStoryIds.mockRejectedValue(new Error("HN API request failed: 500"));

    await expect(isOnAFeed(1)).rejects.toThrow("HN API request failed: 500");
  });
});
