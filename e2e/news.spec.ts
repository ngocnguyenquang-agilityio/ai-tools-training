import { expect, type Page, test } from "@playwright/test";

// These read the live Hacker News API, so they assert on structure (counts,
// URLs, the active tab) and never on a specific story.

const storyTitles = (page: Page) =>
  page.getByRole("main").getByRole("heading", { level: 2 });

const feedTab = (page: Page, name: string) =>
  page.getByRole("navigation", { name: "Feeds" }).getByRole("link", { name });

test.describe("home page", () => {
  test("lists stories with a link to each", async ({ page }) => {
    await page.goto("/");

    const titles = storyTitles(page);
    await expect(titles.first()).toBeVisible();
    expect(await titles.count()).toBeGreaterThan(1);
    await expect(titles.first().getByRole("link")).toHaveAttribute(
      "href",
      /^https?:\/\//,
    );
  });

  test("marks Top as the active feed", async ({ page }) => {
    await page.goto("/");

    await expect(feedTab(page, "Top")).toHaveAttribute("aria-current", "page");
    await expect(feedTab(page, "New")).not.toHaveAttribute("aria-current");
  });

  test("switches to the New feed from its tab", async ({ page }) => {
    await page.goto("/");

    await feedTab(page, "New").click();

    await expect(page).toHaveURL(/[?&]feed=new(&|$)/);
    await expect(feedTab(page, "New")).toHaveAttribute("aria-current", "page");
    await expect(feedTab(page, "Top")).not.toHaveAttribute("aria-current");
  });

  test("pages forward and back, keeping the page in the URL", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Go to next page" }).click();

    await expect(page).toHaveURL(/[?&]page=2(&|$)/);
    await expect(page.getByText(/^Page 2 of \d+$/)).toBeVisible();

    await page.getByRole("link", { name: "Go to previous page" }).click();

    await expect(page).toHaveURL(/[?&]page=1(&|$)/);
    await expect(page.getByText(/^Page 1 of \d+$/)).toBeVisible();
  });

  test("falls back to Top, page 1, for /?feed=foo&page=-1", async ({
    page,
  }) => {
    await page.goto("/?feed=foo&page=-1");

    await expect(feedTab(page, "Top")).toHaveAttribute("aria-current", "page");
    await expect(page.getByText(/^Page 1 of \d+$/)).toBeVisible();
    await expect(storyTitles(page).first()).toBeVisible();
  });
});
