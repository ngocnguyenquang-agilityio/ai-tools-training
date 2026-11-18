/**
 * @jest-environment node
 */
import { extractArticleText, MAX_ARTICLE_CHARS } from "./extract";

jest.mock("server-only", () => ({}));

const paragraph =
  "Static analysis catches whole classes of bugs before the code ever runs, " +
  "which is why teams that adopt it early tend to ship fewer regressions. ";

const page = (body: string, title = "Why static analysis matters") =>
  `<!doctype html><html><head><title>${title}</title>` +
  `<script>window.tracker = "SCRIPT-SENTINEL";</script></head>` +
  `<body>${body}</body></html>`;

const article = (paragraphs: number) =>
  `<nav><a href="/">NAV-SENTINEL Home</a><a href="/about">About</a></nav>` +
  `<article><h1>Why static analysis matters</h1>` +
  Array.from({ length: paragraphs }, () => `<p>${paragraph}</p>`).join("") +
  `</article><footer>FOOTER-SENTINEL Copyright</footer>`;

describe("extractArticleText", () => {
  it("returns the article's title and text without the page chrome", () => {
    const result = extractArticleText(page(article(6)));

    expect(result?.title).toBe("Why static analysis matters");
    expect(result?.text).toContain("Static analysis catches whole classes");
    expect(result?.text).not.toContain("NAV-SENTINEL");
    expect(result?.text).not.toContain("FOOTER-SENTINEL");
    expect(result?.text).not.toContain("SCRIPT-SENTINEL");
  });

  it("collapses runs of whitespace into single spaces", () => {
    const result = extractArticleText(page(article(6)));

    expect(result?.text).not.toMatch(/\s{2,}/);
  });

  it(`caps the text at ${MAX_ARTICLE_CHARS} characters`, () => {
    const result = extractArticleText(page(article(400)));

    expect(result?.text).toHaveLength(MAX_ARTICLE_CHARS);
  });

  it.each([
    [
      "a page that asks for JavaScript",
      page("<p>Please enable JavaScript to view this page.</p>"),
    ],
    ["a page with only a login form", page("<form><input name='user'></form>")],
    ["an empty page", ""],
  ])("returns null for %s", (_label, html) => {
    expect(extractArticleText(html)).toBeNull();
  });
});
