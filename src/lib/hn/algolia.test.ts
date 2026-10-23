/**
 * @jest-environment node
 */
import { type AlgoliaHit, searchStories } from "./algolia";

const API_BASE = "https://hn.algolia.com/api/v1";

function hit(id: number, overrides: Partial<AlgoliaHit> = {}): AlgoliaHit {
  return {
    objectID: String(id),
    title: `Story ${id}`,
    url: `https://www.example.com/${id}`,
    author: `user${id}`,
    points: 10,
    num_comments: 3,
    created_at_i: 1_700_000_000,
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

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

describe("searchStories", () => {
  it("searches stories by relevance with a 5-minute revalidate", async () => {
    const url = `${API_BASE}/search?query=rust&tags=story&page=0&hitsPerPage=30`;
    const fetchMock = mockFetch({ [url]: { hits: [hit(1)], nbPages: 4 } });

    const result = await searchStories(
      { q: "rust" },
      { sort: "relevance", page: 1, pageSize: 30 },
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(url, {
      next: { revalidate: 300 },
    });
    expect(result).toEqual({
      stories: [
        {
          id: 1,
          title: "Story 1",
          url: "https://www.example.com/1",
          domain: "example.com",
          author: "user1",
          score: 10,
          commentsCount: 3,
          publishedAt: new Date(1_700_000_000 * 1000),
          commentsUrl: "https://news.ycombinator.com/item?id=1",
        },
      ],
      totalPages: 4,
    });
  });

  it("sorts by date with search_by_date and sends Algolia's 0-based page", async () => {
    const url = `${API_BASE}/search_by_date?query=rust&tags=story&page=2&hitsPerPage=10`;
    const fetchMock = mockFetch({ [url]: { hits: [], nbPages: 4 } });

    await searchStories({ q: "rust" }, { sort: "date", page: 3, pageSize: 10 });

    expect(fetchMock).toHaveBeenCalledWith(url, expect.anything());
  });

  it("matches a site against the URL only, without typo tolerance", async () => {
    const url =
      `${API_BASE}/search?query=lwn.net&tags=story&page=0&hitsPerPage=30` +
      "&restrictSearchableAttributes=url&typoTolerance=false";
    const fetchMock = mockFetch({ [url]: { hits: [], nbPages: 0 } });

    const result = await searchStories(
      { site: "lwn.net" },
      { sort: "relevance", page: 1, pageSize: 30 },
    );

    expect(fetchMock).toHaveBeenCalledWith(url, expect.anything());
    expect(result).toEqual({ stories: [], totalPages: 0 });
  });

  it("links a text post to HN, with no domain, and defaults null fields", async () => {
    const url = `${API_BASE}/search?query=ask&tags=story&page=0&hitsPerPage=30`;
    mockFetch({
      [url]: {
        hits: [
          hit(7, {
            url: null,
            author: null,
            points: null,
            num_comments: null,
          }),
        ],
        nbPages: 1,
      },
    });

    const { stories } = await searchStories(
      { q: "ask" },
      { sort: "relevance", page: 1, pageSize: 30 },
    );

    expect(stories[0]).toMatchObject({
      url: "https://news.ycombinator.com/item?id=7",
      domain: null,
      author: "",
      score: 0,
      commentsCount: 0,
    });
  });

  it("drops hits without a title", async () => {
    const url = `${API_BASE}/search?query=x&tags=story&page=0&hitsPerPage=30`;
    mockFetch({
      [url]: { hits: [hit(1, { title: null }), hit(2)], nbPages: 1 },
    });

    const { stories } = await searchStories(
      { q: "x" },
      { sort: "relevance", page: 1, pageSize: 30 },
    );

    expect(stories.map((story) => story.id)).toEqual([2]);
  });

  it("throws with the status when the request fails", async () => {
    mockFetch({});

    await expect(
      searchStories({ q: "x" }, { sort: "relevance", page: 1, pageSize: 30 }),
    ).rejects.toThrow("HN search request failed: 404 Not Found");
  });

  it.each([
    ["page 0", 0, 30],
    ["a fractional page", 1.5, 30],
    ["pageSize 0", 1, 0],
  ])("rejects %s without fetching", async (_, page, pageSize) => {
    const fetchMock = mockFetch({});

    await expect(
      searchStories({ q: "x" }, { sort: "relevance", page, pageSize }),
    ).rejects.toThrow(RangeError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
