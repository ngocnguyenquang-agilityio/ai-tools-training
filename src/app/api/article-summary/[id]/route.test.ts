/**
 * @jest-environment node
 */
import Anthropic from "@anthropic-ai/sdk";

import { GET } from "@/app/api/article-summary/[id]/route";
import {
  ArticleSummaryFailedError,
  getArticleSummary,
} from "@/lib/ai/article-summary";
import { isOnAFeed } from "@/lib/hn/feed-ids";

jest.mock("@/lib/ai/article-summary", () => {
  class ArticleSummaryFailedError extends Error {}
  return { getArticleSummary: jest.fn(), ArticleSummaryFailedError };
});

jest.mock("@/lib/hn/feed-ids", () => ({ isOnAFeed: jest.fn() }));

const mockGetArticleSummary = jest.mocked(getArticleSummary);
const mockIsOnAFeed = jest.mocked(isOnAFeed);

const callRoute = (id: string) =>
  GET(new Request(`http://localhost/api/article-summary/${id}`), {
    params: Promise.resolve({ id }),
  });

const originalKey = process.env.ANTHROPIC_API_KEY;

describe("GET /api/article-summary/[id]", () => {
  beforeEach(() => {
    mockGetArticleSummary.mockReset();
    mockIsOnAFeed.mockReset().mockResolvedValue(true);
    process.env.ANTHROPIC_API_KEY = "test-key";
  });

  afterEach(() => {
    process.env.ANTHROPIC_API_KEY = originalKey;
    jest.restoreAllMocks();
  });

  it("returns the summary as JSON", async () => {
    mockGetArticleSummary.mockResolvedValue({ summary: "It is about X." });

    const res = await callRoute("42");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ summary: "It is about X." });
    expect(mockGetArticleSummary).toHaveBeenCalledWith(42);
  });

  it.each([
    ["zero", "0"],
    ["a negative number", "-1"],
    ["a non-number", "abc"],
    ["exponent notation", "1e3"],
    ["a hex literal", "0x10"],
    ["an unsafe integer", "9007199254740993"],
  ])("rejects %s with 400", async (_, id) => {
    const res = await callRoute(id);

    expect(res.status).toBe(400);
    expect(mockGetArticleSummary).not.toHaveBeenCalled();
  });

  it("answers 503 without fetching or calling Claude when there's no API key", async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const res = await callRoute("42");

    expect(res.status).toBe(503);
    expect(mockIsOnAFeed).not.toHaveBeenCalled();
    expect(mockGetArticleSummary).not.toHaveBeenCalled();
  });

  it("answers 403 without fetching or calling Claude for a story that isn't on a feed", async () => {
    mockIsOnAFeed.mockResolvedValue(false);

    const res = await callRoute("42");

    expect(res.status).toBe(403);
    expect(mockIsOnAFeed).toHaveBeenCalledWith(42);
    expect(mockGetArticleSummary).not.toHaveBeenCalled();
  });

  it("answers 502 when the feed check fails", async () => {
    mockIsOnAFeed.mockRejectedValue(new Error("HN API request failed: 500"));
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await callRoute("42");

    expect(res.status).toBe(502);
    expect(mockGetArticleSummary).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it("answers 404 when the ID isn't a live story or has no article link", async () => {
    mockGetArticleSummary.mockResolvedValue(null);

    expect((await callRoute("42")).status).toBe(404);
  });

  it("answers 422 when the article can't be read", async () => {
    mockGetArticleSummary.mockResolvedValue({ summary: null });

    const res = await callRoute("42");

    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({
      error: "Couldn't read this article",
    });
  });

  it.each([
    ["an ArticleSummaryFailedError", new ArticleSummaryFailedError("declined")],
    [
      "an Anthropic API error",
      new Anthropic.APIError(529, undefined, "overloaded", new Headers()),
    ],
  ])("answers 502 and logs on %s", async (_, cause) => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockGetArticleSummary.mockRejectedValue(cause);

    const res = await callRoute("42");

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({
      error: "Couldn't summarize this article",
    });
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it("rethrows errors that aren't a failed summary", async () => {
    mockGetArticleSummary.mockRejectedValue(new TypeError("bug"));

    await expect(callRoute("42")).rejects.toThrow("bug");
  });
});
