import { expect, test } from "@playwright/test";

// Runs against a build WITHOUT Supabase configured ("sample mode"): the booking must hand off to WhatsApp,
// never show a fake confirmation.
test("repair page has no horizontal overflow", async ({ page }) => {
  await page.goto("/repair");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("hero CTAs work and screen comparison slider is operable", async ({ page }) => {
  await page.goto("/repair");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Your Phone Deserves Better");
  await page.getByRole("link", { name: "Explore Services" }).first().click();
  await expect(page).toHaveURL(/#services/);
  const slider = page.getByLabel("Compare cracked and repaired screen");
  await slider.focus();
  await slider.press("ArrowRight");
});

test("wizard walks end-to-end and ends in a WhatsApp handoff, not a fake booking", async ({ page }) => {
  await page.goto("/repair?service=screen-replacement#book");
  await expect(page.getByText("Online booking isn’t switched on yet")).toBeVisible();

  // validation blocks empty progress
  await page.getByRole("button", { name: /^Next/ }).click();
  await expect(page.getByText("Choose your phone brand")).toBeVisible();

  await page.getByRole("button", { name: "Samsung" }).click();
  await page.getByLabel("Search your model").fill("A34");
  await page.getByRole("button", { name: "Galaxy A34" }).click();
  await page.getByRole("button", { name: /^Next/ }).click();

  // service preselected from the card link
  await expect(page.getByRole("button", { name: /Screen replacement/ })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /^Next/ }).click();

  await page.getByRole("button", { name: /Home doorstep repair/ }).click();
  await page.getByRole("button", { name: /^Next/ }).click();

  await page.getByLabel("Full address").fill("12 Test Road, Andheri");
  await page.getByLabel("PIN code").fill("400053");
  await page.getByLabel("City").fill("Mumbai");
  await page.getByLabel("Your name").fill("Asha Test");
  await page.getByLabel("Mobile number").fill("98200 11111");
  await page.getByRole("button", { name: /^Next/ }).click();

  await expect(page.getByText("No fixed appointment times are published")).toBeVisible();
  await page.getByRole("button", { name: /Continue without a time/ }).click();

  await expect(page.getByText("Quoted after diagnosis")).toBeVisible();
  await page.getByRole("button", { name: "Send request on WhatsApp" }).click();
  await expect(page.getByText("Please confirm to continue")).toBeVisible();
  await page.getByRole("checkbox").check();
  const wa = page.getByRole("link", { name: "Send request on WhatsApp" });
  await expect(wa).toHaveAttribute("href", /wa\.me\/.*Samsung%20Galaxy%20A34/);
  await expect(page.getByTestId("ticket-number")).toHaveCount(0);
});

test("invalid phone number is rejected in the wizard", async ({ page }) => {
  await page.goto("/repair#book");
  await page.getByRole("button", { name: "Other brand" }).click();
  await page.getByLabel("Brand").fill("Nokia");
  await page.getByLabel("Model", { exact: true }).fill("G21");
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByRole("button", { name: /Something else/ }).click();
  await page.getByLabel("Problem in a few words").fill("No power");
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByRole("button", { name: /Service centre visit/ }).click();
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByLabel("Your name").fill("Asha");
  await page.getByLabel("Mobile number").fill("12345");
  await page.getByRole("button", { name: /^Next/ }).click();
  await expect(page.getByText("Enter a valid Indian mobile number")).toBeVisible();
});

test("tracking explains it is not enabled instead of faking a result", async ({ page }) => {
  await page.goto("/repair/track");
  await expect(page.getByText("Online tracking isn’t switched on yet")).toBeVisible();
  await expect(page.getByRole("button", { name: "Track" })).toBeDisabled();
});
