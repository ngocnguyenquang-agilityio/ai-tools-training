import { expect, test } from "@playwright/test";

// These read the live Hacker News API, so they assert on structure and never
// on a specific story or comment.

test.describe("story page", () => {
  test("opens from a card and collapses and expands a thread", async ({
    page,
  }) => {
    await page.goto("/");

    await page
      .getByRole("main")
      .getByRole("link", { name: /^[1-9]\d* comments?$/ })
      .first()
      .click();

    await expect(page).toHaveURL(/\/story\/\d+$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const thread = page
      .getByRole("list", { name: "Comments" })
      .locator("details")
      .first();
    await expect(thread).toHaveAttribute("open", "");

    await thread.locator("summary").first().click();
    await expect(thread).not.toHaveAttribute("open");

    await thread.locator("summary").first().click();
    await expect(thread).toHaveAttribute("open", "");

    // Threads are native <details>, so the server HTML needs no client script
    // to collapse them.
    const html = await (await page.request.get(page.url())).text();
    expect(html).toContain("<details");
  });

  test("shows the not-found page for a non-numeric ID", async ({ page }) => {
    await page.goto("/story/abc");

    await expect(page.getByText("This page could not be found.")).toBeVisible();
  });
});
