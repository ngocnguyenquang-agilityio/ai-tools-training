import { expect, test } from "@playwright/test";

// Each test gets a fresh browser context, so localStorage starts empty.

test("saves a story, finds it on Saved after a reload, and removes it", async ({
  page,
}) => {
  await page.goto("/");
  // The feed tabs are list items too, so pick the first one with a story title.
  const card = page
    .getByRole("main")
    .getByRole("listitem")
    .filter({ has: page.getByRole("heading", { level: 2 }) })
    .first();
  const title = await card.getByRole("heading", { level: 2 }).innerText();
  const saveButton = card.getByRole("button", { name: /^Save / });

  // The button only works once React has hydrated, and Playwright can click
  // before that, so click again until the pressed state shows. Never click a
  // pressed button: that would unsave the story.
  await expect(async () => {
    if ((await saveButton.getAttribute("aria-pressed")) !== "true") {
      await saveButton.click();
    }
    await expect(saveButton).toHaveAttribute("aria-pressed", "true", {
      timeout: 1_000,
    });
  }).toPass();

  await page.getByRole("link", { name: "Saved" }).click();
  await expect(page).toHaveURL(/\/saved$/);
  await expect(
    page.getByRole("heading", { level: 2, name: title }),
  ).toBeVisible();

  await page.reload();
  const saved = page.getByRole("heading", { level: 2, name: title });
  await expect(saved).toBeVisible();

  await page.getByRole("button", { name: /^Save / }).click();

  await expect(saved).toBeHidden();
  await expect(page.getByText(/nothing saved yet/i)).toBeVisible();
});

test("shows an empty state on Saved when nothing is saved", async ({
  page,
}) => {
  await page.goto("/saved");

  await expect(page.getByText(/nothing saved yet/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "feed" })).toHaveAttribute(
    "href",
    "/",
  );
});
