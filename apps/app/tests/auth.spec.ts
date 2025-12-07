import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('/login');
  });

  test('should display login page with correct elements', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Em-Plor/);

    // Check heading and subtitle
    await expect(page.getByRole('heading', { name: /sign in to account/i })).toBeVisible();
    await expect(page.getByText(/please sign in to your account to manage your employees/i)).toBeVisible();

    // Check form fields
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();

    // Check submit button
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should have pre-filled email and password fields', async ({ page }) => {
    // Check that email field has default value
    const emailInput = page.getByLabel(/email address/i);
    await expect(emailInput).toHaveValue('genesys.admin@example.com');

    // Check that password field has default value
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toHaveValue('password');
  });

  test('should allow user to type in email and password fields', async ({ page }) => {
    const emailInput = page.getByLabel(/email address/i);
    const passwordInput = page.getByLabel(/password/i);

    // Clear and type new email
    await emailInput.clear();
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');

    // Clear and type new password
    await passwordInput.clear();
    await passwordInput.fill('newpassword123');
    await expect(passwordInput).toHaveValue('newpassword123');
  });

  test('should successfully authenticate with valid credentials', async ({ page }) => {
    // Use the pre-filled credentials (genesys.admin@example.com / password)
    const submitButton = page.getByRole('button', { name: /sign in/i });
    
    // Submit the form
    await submitButton.click();

    // Wait for navigation to dashboard after successful login
    await page.waitForURL('/', { timeout: 10000 });

    // Verify we're on the dashboard
    expect(page.url()).toBe('http://localhost:3000/');
  });

  test('should have required attributes on form fields', async ({ page }) => {
    const emailInput = page.getByLabel(/email address/i);
    const passwordInput = page.getByLabel(/password/i);

    // Check that fields have required attribute
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');

    // Check email field type
    await expect(emailInput).toHaveAttribute('type', 'email');

    // Check password field type
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Check autocomplete attributes
    await expect(emailInput).toHaveAttribute('autocomplete', 'email');
    await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });
});
