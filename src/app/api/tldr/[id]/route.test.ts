/**
 * @jest-environment node
 */
import Anthropic from "@anthropic-ai/sdk";

import { GET } from "@/app/api/tldr/[id]/route";
import { getTldr, TldrFailedError } from "@/lib/ai/tldr";

jest.mock("@/lib/ai/tldr", () => {
  class TldrFailedError extends Error {}
  return { getTldr: jest.fn(), TldrFailedError };
});

const mockGetTldr = jest.mocked(getTldr);

const callRoute = (id: string) =>
  GET(new Request(`http://localhost/api/tldr/${id}`), {
    params: Promise.resolve({ id }),
  });

const originalKey = process.env.ANTHROPIC_API_KEY;

describe("GET /api/tldr/[id]", () => {
  beforeEach(() => {
    mockGetTldr.mockReset();
    process.env.ANTHROPIC_API_KEY = "test-key";
  });

  afterEach(() => {
    process.env.ANTHROPIC_API_KEY = originalKey;
    jest.restoreAllMocks();
  });

  it("returns the bullets as JSON", async () => {
    mockGetTldr.mockResolvedValue({ bullets: ["A.", "B.", "C."] });

    const res = await callRoute("42");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ bullets: ["A.", "B.", "C."] });
    expect(mockGetTldr).toHaveBeenCalledWith(42);
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
    expect(mockGetTldr).not.toHaveBeenCalled();
  });

  it("answers 503 without calling Claude when there's no API key", async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const res = await callRoute("42");

    expect(res.status).toBe(503);
    expect(mockGetTldr).not.toHaveBeenCalled();
  });

  it("answers 404 when the ID isn't a live story", async () => {
    mockGetTldr.mockResolvedValue(null);

    expect((await callRoute("42")).status).toBe(404);
  });

  it.each([
    ["a TldrFailedError", new TldrFailedError("declined")],
    [
      "an Anthropic API error",
      new Anthropic.APIError(529, undefined, "overloaded", new Headers()),
    ],
  ])("answers 502 and logs on %s", async (_, cause) => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockGetTldr.mockRejectedValue(cause);

    const res = await callRoute("42");

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({
      error: "Couldn't summarize this discussion",
    });
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it("rethrows errors that aren't a failed summary", async () => {
    mockGetTldr.mockRejectedValue(new TypeError("bug"));

    await expect(callRoute("42")).rejects.toThrow("bug");
  });
});
