import { test, expect } from "@playwright/test";

test.describe("Dashboard - Employee Page Visibility", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page and authenticate
    await page.goto("/login");

    // Submit the form with pre-filled credentials
    const submitButton = page.getByRole("button", { name: /sign in/i });
    await submitButton.click();

    // Wait for navigation to dashboard
    await page.waitForURL("/", { timeout: 10000 });
  });

  test("should display the main heading and description", async ({ page }) => {
    // Check main heading
    await expect(page.getByTestId("page-heading")).toBeVisible();
    await expect(page.getByTestId("page-heading")).toHaveText("Employees");

    // Check description text
    await expect(page.getByTestId("page-description")).toBeVisible();
    await expect(page.getByTestId("page-description")).toContainText(
      /Through the Employee Management System \(EMS\)/i,
    );
  });

  test("should display search input field", async ({ page }) => {
    // Check search input is visible
    const searchInput = page.getByTestId("employee-search-input");
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute("placeholder", "Search");
    await expect(searchInput).toHaveAttribute("type", "search");
  });

  test("should display Create button", async ({ page }) => {
    // Check Create button is visible
    const createButton = page.getByTestId("create-employee-button");
    await expect(createButton).toBeVisible();
    await expect(createButton).toHaveClass(/bg-cyan-600/);
  });

  test("should display Sort menu button", async ({ page }) => {
    // Check Sort button is visible
    const sortButton = page.getByTestId("sort-menu-button");
    await expect(sortButton).toBeVisible();

    // Check chevron icon is present
    await expect(sortButton.locator("svg")).toBeVisible();
  });

  test("should display employee list grid", async ({ page }) => {
    // Wait for employee data to load
    await page.waitForTimeout(2000);

    // Check that the employee list container exists
    const employeeList = page.getByTestId("employee-list");
    await expect(employeeList).toBeVisible();

    // Verify list has grid layout classes
    await expect(employeeList).toHaveClass(/grid/);
  });

  test("should display employee cards with correct information", async ({
    page,
  }) => {
    // Wait for employee data to load
    await page.waitForTimeout(2000);

    // Get all employee list items
    const employeeCards = page.getByTestId("employee-card");
    const cardCount = await employeeCards.count();

    // Verify we have employee cards displayed
    expect(cardCount).toBeGreaterThan(0);

    // Check first employee card structure
    if (cardCount > 0) {
      const firstCard = employeeCards.first();

      // Should have employee name (as a heading)
      await expect(firstCard.getByTestId("employee-name")).toBeVisible();

      // Should have department badge
      await expect(
        firstCard.getByTestId("employee-department-badge"),
      ).toBeVisible();

      // Should have Email link
      await expect(firstCard.getByTestId("employee-email-link")).toBeVisible();

      // Should have Edit button
      await expect(firstCard.getByTestId("employee-edit-button")).toBeVisible();

      // Should have employee image
      await expect(firstCard.getByTestId("employee-image")).toBeVisible();
    }
  });

  test("should display Email and Edit actions on employee cards", async ({
    page,
  }) => {
    // Wait for employee data to load
    await page.waitForTimeout(2000);

    const employeeCards = page.getByTestId("employee-card");
    const cardCount = await employeeCards.count();

    if (cardCount > 0) {
      const firstCard = employeeCards.first();

      // Check Email link with envelope icon
      const emailLink = firstCard.getByTestId("employee-email-link");
      await expect(emailLink).toBeVisible();
      await expect(emailLink).toHaveAttribute("href", /mailto:/);
      await expect(emailLink.locator("svg")).toBeVisible(); // Envelope icon

      // Check Edit button with pencil icon
      const editButton = firstCard.getByTestId("employee-edit-button");
      await expect(editButton).toBeVisible();
      await expect(editButton.locator("svg")).toBeVisible(); // Pencil icon
    }
  });

  test("should display pagination when there are employees", async ({
    page,
  }) => {
    // Wait for employee data to load
    await page.waitForTimeout(2000);

    // Check if pagination navigation exists
    const pagination = page.getByTestId("pagination");

    // Pagination should be visible if there are employees
    const employeeCards = page.getByTestId("employee-card");
    const cardCount = await employeeCards.count();

    if (cardCount > 0) {
      await expect(pagination).toBeVisible();
    }
  });

  test("should display employee position and department information", async ({
    page,
  }) => {
    // Wait for employee data to load
    await page.waitForTimeout(2000);

    const employeeCards = page.getByTestId("employee-card");
    const cardCount = await employeeCards.count();

    if (cardCount > 0) {
      const firstCard = employeeCards.first();

      // Check for department badge (green badge with ring)
      const departmentBadge = firstCard.getByTestId(
        "employee-department-badge",
      );
      await expect(departmentBadge).toBeVisible();
      await expect(departmentBadge).toHaveClass(/ring-green-600/);

      // Check for position text
      const positionText = firstCard.getByTestId("employee-position");
      await expect(positionText).toBeVisible();
    }
  });

  test("should display employee images from picsum", async ({ page }) => {
    // Wait for employee data to load
    await page.waitForTimeout(2000);

    const employeeCards = page.getByTestId("employee-card");
    const cardCount = await employeeCards.count();

    if (cardCount > 0) {
      const firstCard = employeeCards.first();
      const employeeImage = firstCard.getByTestId("employee-image");

      // Check image is visible
      await expect(employeeImage).toBeVisible();

      // Check image has correct classes for styling
      await expect(employeeImage).toHaveClass(/rounded-full/);
      await expect(employeeImage).toHaveClass(/bg-gray-300/);

      // Check image src contains picsum
      const imgSrc = await employeeImage.getAttribute("src");
      expect(imgSrc).toContain("picsum");
    }
  });

  test("should display filter section with search functionality", async ({
    page,
  }) => {
    // Check filter section exists
    const filterSection = page.getByTestId("filter-section");
    await expect(filterSection).toBeVisible();

    // Check heading (screen reader only)
    const filterHeading = page.locator("#filter-heading");
    await expect(filterHeading).toBeAttached();
    await expect(filterHeading).toHaveText("Filters");

    // Check search form exists
    const searchForm = filterSection.locator("form");
    await expect(searchForm).toBeVisible();

    // Check search icon is visible
    const searchIcon = filterSection.locator("svg").first();
    await expect(searchIcon).toBeVisible();
  });

  test("should show employee cards with proper shadow and styling", async ({
    page,
  }) => {
    // Wait for employee data to load
    await page.waitForTimeout(2000);

    const employeeCards = page.getByTestId("employee-card");
    const cardCount = await employeeCards.count();

    if (cardCount > 0) {
      const firstCard = employeeCards.first();

      // Check card has proper styling classes
      await expect(firstCard).toHaveClass(/rounded-lg/);
      await expect(firstCard).toHaveClass(/bg-white/);
      await expect(firstCard).toHaveClass(/shadow-sm/);
      await expect(firstCard).toHaveClass(/divide-y/);
      await expect(firstCard).toHaveClass(/divide-gray-200/);
    }
  });

  test("should display employee name as clickable link", async ({ page }) => {
    // Wait for employee data to load
    await page.waitForTimeout(2000);

    const employeeCards = page.getByTestId("employee-card");
    const cardCount = await employeeCards.count();

    if (cardCount > 0) {
      const firstCard = employeeCards.first();
      const employeeName = firstCard.getByTestId("employee-name");

      // Check name is visible and has proper styling
      await expect(employeeName).toBeVisible();
      await expect(employeeName).toHaveClass(/text-cyan-500/);
      await expect(employeeName).toHaveClass(/cursor-pointer/);
      await expect(employeeName).toHaveClass(/hover:text-cyan-600/);
    }
  });

  test("should display reports-to relationship when present", async ({
    page,
  }) => {
    // Wait for employee data to load
    await page.waitForTimeout(2000);

    const employeeCards = page.getByTestId("employee-card");
    const cardCount = await employeeCards.count();

    // Check multiple cards for reports-to relationship
    for (let i = 0; i < Math.min(cardCount, 5); i++) {
      const card = employeeCards.nth(i);
      const reportsToText = card.getByText(/Reports to/i);

      // If this employee has a manager, verify the link is displayed
      if (await reportsToText.isVisible()) {
        await expect(reportsToText).toBeVisible();
        // The manager name should be a clickable link next to "Reports to"
        const managerLink = card.locator("a.text-cyan-500");
        if ((await managerLink.count()) > 0) {
          await expect(managerLink.first()).toBeVisible();
        }
      }
    }
  });
});
