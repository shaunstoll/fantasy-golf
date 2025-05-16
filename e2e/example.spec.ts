import { test, expect } from "@playwright/test";

test("homepage has title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Fantasy Golf/);
});

test("navigation works", async ({ page }) => {
  await page.goto("/");
  // Add your navigation tests here
});
