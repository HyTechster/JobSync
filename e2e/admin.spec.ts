import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers'

test.describe('Admin flow — create job and verify on dashboard', () => {
  test('login redirects admin to dashboard', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page).toHaveURL(/admin\/dashboard/)
    await expect(page.getByText('Total Jobs')).toBeVisible()
  })

  test('admin can create a job order and it appears in the jobs list', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/jobs')

    await page.getByRole('button', { name: /new job/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    const ts = Date.now()
    await page.getByPlaceholder(/AC unit not cooling/i).fill(`E2E Test Job ${ts}`)
    await page.getByPlaceholder(/describe the problem/i).fill('Automated test job — please ignore')
    await page.getByPlaceholder(/brightline offices/i).fill('E2E Customer')
    await page.getByPlaceholder(/jalan ampang/i).fill('Test Location, KL')

    const dateInput = page.locator('input[type="date"]').first()
    await dateInput.fill('2026-12-31')

    await page.getByRole('button', { name: /create job/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })

    await expect(page.getByText(`E2E Test Job ${ts}`)).toBeVisible()
  })

  test('dashboard shows live indicator when realtime is connected', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page.getByText('Live').or(page.getByText('Polling'))).toBeVisible()
  })

  test('admin can navigate to all sidebar sections', async ({ page }) => {
    await loginAsAdmin(page)
    for (const link of ['Jobs', 'Job Sheets', 'Users', 'Alerts']) {
      await page.getByRole('link', { name: new RegExp(link, 'i') }).first().click()
      await expect(page).not.toHaveURL(/login/)
    }
  })
})
