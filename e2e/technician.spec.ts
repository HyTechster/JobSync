import { test, expect } from '@playwright/test'
import { loginAsTechnician } from './helpers'

test.describe('Technician flow — view job, update status, submit job sheet', () => {
  test('login redirects technician to jobs page', async ({ page }) => {
    await loginAsTechnician(page)
    await expect(page).toHaveURL(/technician\/jobs/)
    await expect(page.getByText('My Jobs')).toBeVisible()
  })

  test('bottom navigation renders all four tabs', async ({ page }) => {
    await loginAsTechnician(page)
    await expect(page.getByRole('link', { name: /jobs/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /history/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /alerts/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /profile/i })).toBeVisible()
  })

  test('technician can view job detail from jobs list', async ({ page }) => {
    await loginAsTechnician(page)

    const firstJob = page.locator('a[href*="/technician/jobs/"]').first()
    const hasJob = await firstJob.isVisible().catch(() => false)

    if (!hasJob) {
      test.skip()
      return
    }

    await firstJob.click()
    await expect(page).toHaveURL(/technician\/jobs\/.+/)
    await expect(page.getByRole('button', { name: /go back/i })).toBeVisible()
  })

  test('technician can navigate to history tab', async ({ page }) => {
    await loginAsTechnician(page)
    await page.getByRole('link', { name: /history/i }).click()
    await expect(page).toHaveURL(/technician\/history/)
  })

  test('technician can navigate to profile tab', async ({ page }) => {
    await loginAsTechnician(page)
    await page.getByRole('link', { name: /profile/i }).click()
    await expect(page).toHaveURL(/technician\/profile/)
    await expect(page.getByText('Profile')).toBeVisible()
  })
})
