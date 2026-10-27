/**
 * @jest-environment node
 */
import { getCommentTree, getThreadSample, htmlToText } from "./comments";
import type { HNItem } from "./types";

const API_BASE = "https://hacker-news.firebaseio.com/v0";

function story(id: number, kids: number[]): HNItem {
  return {
    id,
    type: "story",
    by: "pg",
    time: 1_700_000_000,
    title: `Story ${id}`,
    kids,
  };
}

function comment(id: number, overrides: Partial<HNItem> = {}): HNItem {
  return {
    id,
    type: "comment",
    by: `user${id}`,
    time: 1_700_000_000,
    text: `Comment ${id}`,
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

function itemRoutes(items: HNItem[]) {
  return Object.fromEntries(
    items.map((item) => [`${API_BASE}/item/${item.id}.json`, item]),
  );
}

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

describe("htmlToText", () => {
  it.each([
    ["paragraphs", "One<p>Two", "One\n\nTwo"],
    ["inline tags", "<i>really</i> <b>fast</b>", "really fast"],
    [
      "a link",
      '<a href="https://lwn.net/">https://lwn.net/</a>',
      "https://lwn.net/",
    ],
    ["code", "<pre><code>x &lt; 1</code></pre>", "x < 1"],
    ["named entities", "&quot;a&quot; &amp; b &gt; c", '"a" & b > c'],
    ["numeric entities", "it&#x27;s &#47;tmp", "it's /tmp"],
    ["an unknown entity", "&bogus; stays", "&bogus; stays"],
    [
      "numeric entities past U+10FFFF",
      "&#99999999; &#x110000; stay",
      "&#99999999; &#x110000; stay",
    ],
    ["surrounding whitespace", "  <p>hi  ", "hi"],
  ])("converts %s", (_, html, expected) => {
    expect(htmlToText(html)).toBe(expected);
  });
});

describe("getThreadSample", () => {
  it("returns null for an ID that isn't a live story", async () => {
    mockFetch(itemRoutes([comment(1)]));

    expect(await getThreadSample(1)).toBeNull();
  });

  it("walks the thread breadth-first, top-level comments before replies", async () => {
    mockFetch(
      itemRoutes([
        story(1, [10, 20]),
        comment(10, { kids: [11] }),
        comment(20, { kids: [21] }),
        comment(11, { kids: [12] }),
        comment(21),
        comment(12),
      ]),
    );

    const sample = await getThreadSample(1, { maxDepth: 2 });

    expect(sample?.story.id).toBe(1);
    expect(sample?.comments).toEqual([
      { text: "Comment 10", depth: 1 },
      { text: "Comment 20", depth: 1 },
      { text: "Comment 11", depth: 2 },
      { text: "Comment 21", depth: 2 },
    ]);
  });

  it("fetches items with the client's 5-minute revalidate", async () => {
    const fetchMock = mockFetch(itemRoutes([story(1, [10]), comment(10)]));

    await getThreadSample(1);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/item/10.json`, {
      next: { revalidate: 300 },
    });
  });

  it("skips a comment whose fetch fails instead of failing the sample", async () => {
    // Comment 20 has no route, so its fetch returns 404 and getItem throws.
    mockFetch(itemRoutes([story(1, [10, 20, 30]), comment(10), comment(30)]));

    const sample = await getThreadSample(1);

    expect(sample?.comments.map((c) => c.text)).toEqual([
      "Comment 10",
      "Comment 30",
    ]);
    expect(sample?.failed).toBe(1);
  });

  it("skips dead, deleted, null and empty comments, and their replies", async () => {
    mockFetch({
      ...itemRoutes([
        story(1, [10, 20, 30, 40, 50]),
        comment(10, { dead: true, kids: [11] }),
        comment(20, { deleted: true }),
        comment(40, { text: "<p>" }),
        comment(50),
        comment(11),
      ]),
      [`${API_BASE}/item/30.json`]: null,
    });

    const sample = await getThreadSample(1);

    expect(sample?.comments.map((c) => c.text)).toEqual(["Comment 50"]);
  });

  it("stops at maxComments without fetching further levels", async () => {
    const fetchMock = mockFetch(
      itemRoutes([
        story(1, [10, 20, 30]),
        comment(10, { kids: [11] }),
        comment(20),
        comment(30),
      ]),
    );

    const sample = await getThreadSample(1, { maxComments: 2 });

    expect(sample?.comments.map((c) => c.text)).toEqual([
      "Comment 10",
      "Comment 20",
    ]);
    expect(fetchMock).not.toHaveBeenCalledWith(
      `${API_BASE}/item/30.json`,
      expect.anything(),
    );
    expect(fetchMock).not.toHaveBeenCalledWith(
      `${API_BASE}/item/11.json`,
      expect.anything(),
    );
  });

  it("caps the total text at maxChars, cutting the last comment", async () => {
    mockFetch(
      itemRoutes([
        story(1, [10, 20, 30]),
        comment(10, { text: "a".repeat(6) }),
        comment(20, { text: "b".repeat(6) }),
        comment(30, { text: "c".repeat(6) }),
      ]),
    );

    const sample = await getThreadSample(1, { maxChars: 10 });

    expect(sample?.comments.map((c) => c.text)).toEqual(["aaaaaa", "bbbb"]);
  });

  it("returns no comments for a story without any", async () => {
    mockFetch(itemRoutes([{ ...story(1, []), kids: undefined }]));

    expect(await getThreadSample(1)).toEqual({
      story: expect.objectContaining({ id: 1 }),
      comments: [],
      failed: 0,
    });
  });
});

describe("getCommentTree", () => {
  it("nests replies under their parent in HN's ranked order, as plain text", async () => {
    mockFetch(
      itemRoutes([
        story(1, [2, 3]),
        comment(2, { text: "<i>First</i> &amp; best", kids: [4] }),
        comment(3),
        comment(4, { text: "A reply" }),
      ]),
    );

    const tree = await getCommentTree(1);

    expect(tree?.story.id).toBe(1);
    expect(tree?.comments).toEqual([
      {
        id: 2,
        author: "user2",
        publishedAt: new Date("2023-11-14T22:13:20Z"),
        text: "First & best",
        replies: [
          {
            id: 4,
            author: "user4",
            publishedAt: new Date("2023-11-14T22:13:20Z"),
            text: "A reply",
            replies: [],
          },
        ],
      },
      {
        id: 3,
        author: "user3",
        publishedAt: new Date("2023-11-14T22:13:20Z"),
        text: "Comment 3",
        replies: [],
      },
    ]);
  });

  it.each([
    ["a comment", [comment(1)]],
    ["a dead story", [{ ...story(1, []), dead: true }]],
    ["a deleted story", [{ ...story(1, []), deleted: true }]],
  ])("returns null for %s", async (_label, items) => {
    mockFetch(itemRoutes(items));

    await expect(getCommentTree(1)).resolves.toBeNull();
  });

  it("returns null when HN has no such item", async () => {
    mockFetch({ [`${API_BASE}/item/1.json`]: null });

    await expect(getCommentTree(1)).resolves.toBeNull();
  });

  it("skips dead, deleted, empty and failed comments along with their replies", async () => {
    mockFetch(
      itemRoutes([
        story(1, [2, 3, 4, 5, 6]),
        comment(2, { dead: true, kids: [7] }),
        comment(3, { deleted: true, text: undefined }),
        comment(4, { text: undefined }),
        // 5 has no route, so its fetch fails with a 404.
        comment(6),
        comment(7),
      ]),
    );

    const tree = await getCommentTree(1);

    expect(tree?.comments.map(({ id }) => id)).toEqual([6]);
  });

  it("stops at 3 levels by default", async () => {
    mockFetch(
      itemRoutes([
        story(1, [2]),
        comment(2, { kids: [3] }),
        comment(3, { kids: [4] }),
        comment(4, { kids: [5] }),
        comment(5),
      ]),
    );

    const tree = await getCommentTree(1);

    const level3 = tree?.comments[0].replies[0].replies[0];
    expect(level3?.id).toBe(4);
    expect(level3?.replies).toEqual([]);
  });

  it("honours a custom maxDepth", async () => {
    mockFetch(
      itemRoutes([story(1, [2]), comment(2, { kids: [3] }), comment(3)]),
    );

    const tree = await getCommentTree(1, { maxDepth: 1 });

    expect(tree?.comments).toEqual([
      expect.objectContaining({ id: 2, replies: [] }),
    ]);
  });

  it("keeps the top-ranked comments when over maxComments, counting replies", async () => {
    mockFetch(
      itemRoutes([
        story(1, [2, 3, 4]),
        comment(2, { kids: [5] }),
        comment(3),
        comment(4),
        comment(5),
      ]),
    );

    const tree = await getCommentTree(1, { maxComments: 3 });

    expect(tree?.comments.map(({ id }) => id)).toEqual([2, 3, 4]);
    expect(tree?.comments[0].replies).toEqual([]);
  });

  it("does not fetch comments beyond maxComments", async () => {
    const fetchMock = mockFetch(
      itemRoutes([story(1, [2, 3, 4]), comment(2), comment(3), comment(4)]),
    );

    await getCommentTree(1, { maxComments: 2 });

    // The story plus two comments.
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
