import { fireEvent, render, screen } from "@testing-library/react";

import { ArticleSummaryButton } from "@/components/article-summary-button";

const summarizeButton = () =>
  screen.getByRole("button", { name: "Summarize article" });

/** A minimal fetch Response; jsdom has no `Response` global. */
const response = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

/** Stubs fetch with one response; `body` is JSON, `status` defaults to 200. */
function mockFetch(body: unknown, status = 200) {
  const fetchMock = jest.fn(async () => response(body, status));
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

const originalFetch = global.fetch;

describe("ArticleSummaryButton", () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("fetches the summary on the first open and shows it", async () => {
    const fetchMock = mockFetch({ summary: "It argues for static analysis." });
    render(<ArticleSummaryButton storyId={42} />);

    fireEvent.click(summarizeButton());

    expect(summarizeButton()).toHaveAttribute("aria-expanded", "true");
    expect(
      await screen.findByText("It argues for static analysis."),
    ).toBeInTheDocument();
    expect(screen.getByText(/AI summary of the article/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/article-summary/42");
  });

  it("keeps the live region rendered while the panel is closed", () => {
    const { container } = render(<ArticleSummaryButton storyId={42} />);

    const liveRegion = container.querySelector("[aria-live='polite']");
    const panelId = summarizeButton().getAttribute("aria-controls");

    expect(liveRegion).not.toHaveAttribute("hidden");
    expect(liveRegion?.querySelector(`[id='${panelId}']`)).not.toBeVisible();
  });

  it("shows a loading skeleton while the summary loads", () => {
    global.fetch = jest.fn(
      () => new Promise(() => {}),
    ) as unknown as typeof fetch;
    render(<ArticleSummaryButton storyId={42} />);

    fireEvent.click(summarizeButton());

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("closes without refetching, and reopens from the loaded summary", async () => {
    const fetchMock = mockFetch({ summary: "Done." });
    render(<ArticleSummaryButton storyId={42} />);
    fireEvent.click(summarizeButton());
    await screen.findByText("Done.");

    fireEvent.click(summarizeButton());
    fireEvent.click(summarizeButton());

    expect(summarizeButton()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Done.")).toBeVisible();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows an inline message when the request itself fails", async () => {
    global.fetch = jest.fn(async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    render(<ArticleSummaryButton storyId={42} />);

    fireEvent.click(summarizeButton());

    expect(
      await screen.findByText("Couldn't load a summary. Try again."),
    ).toBeInTheDocument();
  });

  it.each([
    ["503 (no API key)", 503, "Summary unavailable."],
    [
      "403 (story off the feeds)",
      403,
      "This story has left the feeds, so it can't be summarized.",
    ],
    ["404 (no article)", 404, "This story has no article to summarize."],
    ["422 (unreadable page)", 422, "Couldn't read this article."],
    ["502 (Claude failed)", 502, "Couldn't load a summary. Try again."],
  ])("shows an inline message on %s", async (_, status, message) => {
    mockFetch({ error: "x" }, status);
    render(<ArticleSummaryButton storyId={42} />);

    fireEvent.click(summarizeButton());

    expect(await screen.findByText(message)).toBeInTheDocument();
  });

  it("shows an inline message when a 200 has no summary text", async () => {
    mockFetch({ bullets: ["unexpected"] });
    render(<ArticleSummaryButton storyId={42} />);

    fireEvent.click(summarizeButton());

    expect(
      await screen.findByText("Couldn't load a summary. Try again."),
    ).toBeInTheDocument();
  });

  it("retries on the next open after a failure", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(response({}, 502))
      .mockResolvedValueOnce(response({ summary: "Recovered." }));
    global.fetch = fetchMock as unknown as typeof fetch;
    render(<ArticleSummaryButton storyId={42} />);
    fireEvent.click(summarizeButton());
    await screen.findByText("Couldn't load a summary. Try again.");

    fireEvent.click(summarizeButton());
    fireEvent.click(summarizeButton());

    expect(await screen.findByText("Recovered.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
