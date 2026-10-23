import { fireEvent, render, screen } from "@testing-library/react";

import { TldrButton } from "@/components/tldr-button";

const tldrButton = () => screen.getByRole("button", { name: "TL;DR" });

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

describe("TldrButton", () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("renders nothing for a story with fewer than 5 comments", () => {
    const { container } = render(<TldrButton storyId={1} commentsCount={4} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("fetches the summary on the first open and shows the bullets", async () => {
    const fetchMock = mockFetch({ bullets: ["One.", "Two.", "Three."] });
    render(<TldrButton storyId={42} commentsCount={5} />);

    fireEvent.click(tldrButton());

    expect(tldrButton()).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByText("One.")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText(/AI summary of the comments/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/tldr/42");
  });

  it("keeps the live region rendered while the panel is closed", () => {
    const { container } = render(<TldrButton storyId={42} commentsCount={5} />);

    const liveRegion = container.querySelector("[aria-live='polite']");
    const panelId = tldrButton().getAttribute("aria-controls");

    expect(liveRegion).not.toHaveAttribute("hidden");
    expect(liveRegion?.querySelector(`[id='${panelId}']`)).not.toBeVisible();
  });

  it("shows a loading skeleton while the summary loads", () => {
    global.fetch = jest.fn(
      () => new Promise(() => {}),
    ) as unknown as typeof fetch;
    render(<TldrButton storyId={42} commentsCount={5} />);

    fireEvent.click(tldrButton());

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("closes without refetching, and reopens from the loaded summary", async () => {
    const fetchMock = mockFetch({ bullets: ["One."] });
    render(<TldrButton storyId={42} commentsCount={5} />);
    fireEvent.click(tldrButton());
    await screen.findByText("One.");

    fireEvent.click(tldrButton());
    fireEvent.click(tldrButton());

    expect(tldrButton()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("One.")).toBeVisible();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows an inline message when the request itself fails", async () => {
    global.fetch = jest.fn(async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    render(<TldrButton storyId={42} commentsCount={5} />);

    fireEvent.click(tldrButton());

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
    ["502 (Claude failed)", 502, "Couldn't load a summary. Try again."],
  ])("shows an inline message on %s", async (_, status, message) => {
    mockFetch({ error: "x" }, status);
    render(<TldrButton storyId={42} commentsCount={5} />);

    fireEvent.click(tldrButton());

    expect(await screen.findByText(message)).toBeInTheDocument();
  });

  it("retries on the next open after a failure", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(response({}, 502))
      .mockResolvedValueOnce(response({ bullets: ["Recovered."] }));
    global.fetch = fetchMock as unknown as typeof fetch;
    render(<TldrButton storyId={42} commentsCount={5} />);
    fireEvent.click(tldrButton());
    await screen.findByText("Couldn't load a summary. Try again.");

    fireEvent.click(tldrButton());
    fireEvent.click(tldrButton());

    expect(await screen.findByText("Recovered.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("says when there's not enough discussion to summarize", async () => {
    mockFetch({ bullets: [] });
    render(<TldrButton storyId={42} commentsCount={5} />);

    fireEvent.click(tldrButton());

    expect(
      await screen.findByText("Not enough discussion to summarize yet."),
    ).toBeInTheDocument();
  });
});
