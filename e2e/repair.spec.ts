import { expect, test } from "@playwright/test";

// Runs against a build WITHOUT Supabase configured ("sample mode"): the booking must hand off to WhatsApp,
// never show a fake confirmation.
test("repair page has no horizontal overflow", async ({ page }) => {
  await page.goto("/repair");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("landing: hero, device tabs, steps carousel, curious cards and FAQ all respond", async ({ page }) => {
  await page.goto("/repair");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("MOBILE REPAIR AT YOUR");
  await expect(page.getByRole("link", { name: /Book on WhatsApp/ })).toHaveAttribute("href", /wa\.me\/918655770559/);

  await page.getByRole("tab", { name: /Laptop/ }).click();
  await expect(page.getByRole("link", { name: /Ask on WhatsApp/ })).toHaveAttribute("href", /wa\.me/);
  await page.getByRole("tab", { name: /Phone/ }).click();

  await page.getByRole("button", { name: /Learn more/ }).first().click();
  await expect(page.getByRole("button", { name: "Back" })).toBeVisible();

  const faq = page.getByRole("button", { name: /What parts do you use/ });
  await faq.click();
  await expect(faq).toHaveAttribute("aria-expanded", "true");
});

test("booking: device → issue → details → WhatsApp handoff, never a fake confirmation", async ({ page }) => {
  await page.goto("/repair/book");
  const next = page.getByRole("button", { name: /Choose your model/ });
  await expect(next).toBeDisabled();

  await page.getByRole("button", { name: "Samsung" }).click();
  await page.getByRole("button", { name: "Galaxy A34" }).click();
  await page.getByRole("button", { name: /Select issue in next step/ }).click();

  await expect(page).toHaveURL(/\/repair\/book\/issue/);
  await expect(page.getByText("Samsung Galaxy A34")).toBeVisible();
  await page.getByRole("button", { name: /Add Screen replacement/ }).click();
  await page.getByRole("button", { name: /Add details in next step/ }).click();

  await expect(page).toHaveURL(/\/repair\/book\/details/);
  await expect(page.getByText("Online booking isn’t switched on yet")).toBeVisible();
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

  await page.getByRole("button", { name: "Send request on WhatsApp" }).click();
  await expect(page.getByText("Please confirm to continue")).toBeVisible();
  await page.getByRole("checkbox").check();
  await expect(page.getByRole("link", { name: "Send request on WhatsApp" })).toHaveAttribute("href", /wa\.me\/.*Samsung%20Galaxy%20A34/);
  await expect(page.getByTestId("ticket-number")).toHaveCount(0);
});

test("booking: an unlisted phone with a described problem rejects an invalid number", async ({ page }) => {
  await page.goto("/repair/book");
  await page.getByRole("button", { name: /isn’t listed/ }).click();
  await page.getByLabel("Brand").fill("Nokia");
  await page.getByLabel("Model", { exact: true }).fill("G21");
  await page.getByRole("button", { name: /Select issue in next step/ }).click();
  await page.getByRole("button", { name: /Add something else/ }).click();
  await page.getByRole("button", { name: /Add details in next step/ }).click();

  await page.getByLabel("What is wrong?").fill("No power");
  await page.getByRole("button", { name: /Service centre visit/ }).click();
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByLabel("Your name").fill("Asha");
  await page.getByLabel("Mobile number").fill("12345");
  await page.getByRole("button", { name: /^Next/ }).click();
  await expect(page.getByText("Enter a valid Indian mobile number")).toBeVisible();
});

test("details page without a chosen device redirects back to step 1", async ({ page }) => {
  await page.goto("/repair/book/details");
  await expect(page).toHaveURL(/\/repair\/book$/);
});

test("tracking explains it is not enabled instead of faking a result", async ({ page }) => {
  await page.goto("/repair/track");
  await expect(page.getByText("Online tracking isn’t switched on yet")).toBeVisible();
  await expect(page.getByRole("button", { name: "Track" })).toBeDisabled();
});
