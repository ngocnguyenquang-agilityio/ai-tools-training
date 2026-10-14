/**
 * @jest-environment node
 */
import { getItem, getStories, getStoryIds } from "./client";
import type { HNItem } from "./types";

const API_BASE = "https://hacker-news.firebaseio.com/v0";

function story(id: number, overrides: Partial<HNItem> = {}): HNItem {
  return {
    id,
    type: "story",
    by: `user${id}`,
    time: 1_700_000_000,
    title: `Story ${id}`,
    url: `https://example.com/${id}`,
    score: 10,
    descendants: 3,
    ...overrides,
  };
}

/** Mocks `fetch` with a map of URL -> JSON body; unknown URLs return 404. */
function mockFetch(routes: Record<string, unknown>) {
  const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (!(url in routes)) {
      return new Response("Not Found", {
        status: 404,
        statusText: "Not Found",
      });
    }
    return Response.json(routes[url]);
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

function itemRoutes(items: Record<number, HNItem | null>) {
  return Object.fromEntries(
    Object.entries(items).map(([id, item]) => [
      `${API_BASE}/item/${id}.json`,
      item,
    ]),
  );
}

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

describe("getStoryIds", () => {
  it.each([
    ["top", "topstories"],
    ["new", "newstories"],
    ["best", "beststories"],
  ] as const)(
    "fetches the %s feed with a 5-minute revalidate",
    async (feed, endpoint) => {
      const fetchMock = mockFetch({ [`${API_BASE}/${endpoint}.json`]: [1, 2] });

      await expect(getStoryIds(feed)).resolves.toEqual([1, 2]);
      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/${endpoint}.json`, {
        next: { revalidate: 300 },
      });
    },
  );
});

describe("getItem", () => {
  it("returns null when the API returns null", async () => {
    mockFetch(itemRoutes({ 7: null }));

    await expect(getItem(7)).resolves.toBeNull();
  });

  it("throws a descriptive error on a non-OK response", async () => {
    mockFetch({});

    await expect(getItem(99)).rejects.toThrow(
      `HN API request failed: 404 Not Found (${API_BASE}/item/99.json)`,
    );
  });
});

describe("getStories", () => {
  it("normalizes items into stories", async () => {
    mockFetch({
      [`${API_BASE}/topstories.json`]: [1, 2],
      ...itemRoutes({
        1: story(1, { url: "https://www.example.com/post" }),
        2: story(2, { url: undefined, descendants: undefined }),
      }),
    });

    const { stories } = await getStories("top", { page: 1, pageSize: 10 });

    expect(stories).toEqual([
      {
        id: 1,
        title: "Story 1",
        url: "https://www.example.com/post",
        domain: "example.com",
        author: "user1",
        score: 10,
        commentsCount: 3,
        publishedAt: new Date(1_700_000_000_000),
        commentsUrl: "https://news.ycombinator.com/item?id=1",
      },
      expect.objectContaining({
        id: 2,
        url: "https://news.ycombinator.com/item?id=2",
        domain: null,
        commentsCount: 0,
      }),
    ]);
    expect(stories[0].publishedAt).toBeInstanceOf(Date);
  });

  it("drops null, deleted, dead and non-story items", async () => {
    mockFetch({
      [`${API_BASE}/newstories.json`]: [1, 2, 3, 4, 5],
      ...itemRoutes({
        1: story(1),
        2: null,
        3: story(3, { deleted: true }),
        4: story(4, { dead: true }),
        5: story(5, { type: "job" }),
      }),
    });

    const { stories } = await getStories("new", { page: 1, pageSize: 10 });

    expect(stories.map((s) => s.id)).toEqual([1]);
  });

  it("fills the page from the following IDs when items are dropped", async () => {
    const ids = [1, 2, 3, 4, 5, 6, 7];
    const fetchMock = mockFetch({
      [`${API_BASE}/topstories.json`]: ids,
      ...itemRoutes({
        1: story(1),
        2: story(2, { dead: true }),
        3: story(3),
        4: story(4, { type: "job" }),
        5: null,
        6: story(6),
        7: story(7),
      }),
    });

    const { stories } = await getStories("top", { page: 1, pageSize: 3 });

    expect(stories.map((s) => s.id)).toEqual([1, 3, 6]);
    // IDs 1-3, then 4, 5 and 6 one at a time to refill the slot; 7 is never fetched.
    expect(fetchMock).toHaveBeenCalledTimes(1 + 6);
  });

  it("returns a short page when the feed runs out of live stories", async () => {
    mockFetch({
      [`${API_BASE}/topstories.json`]: [1, 2, 3],
      ...itemRoutes({ 1: story(1), 2: null, 3: story(3, { deleted: true }) }),
    });

    const { stories } = await getStories("top", { page: 1, pageSize: 3 });

    expect(stories.map((s) => s.id)).toEqual([1]);
  });

  it("fetches only the requested page and computes totalPages", async () => {
    const ids = Array.from({ length: 25 }, (_, i) => i + 1);
    const fetchMock = mockFetch({
      [`${API_BASE}/beststories.json`]: ids,
      ...itemRoutes(Object.fromEntries(ids.map((id) => [id, story(id)]))),
    });

    const { stories, totalPages } = await getStories("best", {
      page: 3,
      pageSize: 10,
    });

    expect(totalPages).toBe(3);
    expect(stories.map((s) => s.id)).toEqual([21, 22, 23, 24, 25]);
    // One call for the ID list, plus one per item on the page.
    expect(fetchMock).toHaveBeenCalledTimes(1 + 5);
  });

  it("throws when the feed request fails", async () => {
    mockFetch({});

    await expect(getStories("top", { page: 1, pageSize: 10 })).rejects.toThrow(
      /HN API request failed: 404/,
    );
  });

  it("returns no stories and zero pages for an empty feed", async () => {
    mockFetch({ [`${API_BASE}/topstories.json`]: [] });

    await expect(getStories("top", { page: 1, pageSize: 10 })).resolves.toEqual(
      { stories: [], totalPages: 0 },
    );
  });

  it("returns an empty page past totalPages", async () => {
    const ids = Array.from({ length: 25 }, (_, i) => i + 1);
    mockFetch({ [`${API_BASE}/topstories.json`]: ids });

    await expect(getStories("top", { page: 4, pageSize: 10 })).resolves.toEqual(
      { stories: [], totalPages: 3 },
    );
  });

  it("falls back to the HN item URL for non-http links", async () => {
    mockFetch({
      [`${API_BASE}/topstories.json`]: [1],
      ...itemRoutes({ 1: story(1, { url: "javascript:alert(1)" }) }),
    });

    const { stories } = await getStories("top", { page: 1, pageSize: 10 });

    expect(stories[0]).toMatchObject({
      url: "https://news.ycombinator.com/item?id=1",
      domain: null,
    });
  });

  it.each([
    { page: 0, pageSize: 10 },
    { page: Number.NaN, pageSize: 10 },
    { page: 1, pageSize: 0 },
  ])("rejects invalid paging %o", async (paging) => {
    const fetchMock = mockFetch({});

    await expect(getStories("top", paging)).rejects.toThrow(RangeError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws when the feed response is not an array", async () => {
    mockFetch({ [`${API_BASE}/topstories.json`]: null });

    await expect(getStories("top", { page: 1, pageSize: 10 })).rejects.toThrow(
      'HN API returned no story IDs for feed "top"',
    );
  });
});
