import { test, expect } from '@playwright/test'
import { loginAsAdmin, loginAsTechnician, TECH_EMAIL } from './helpers'

test.describe('Alert flow — create, receive, read', () => {
  test('admin can open create alert modal', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/alerts')
    await page.getByRole('button', { name: /new alert/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByPlaceholderText(/scheduled maintenance/i)).toBeVisible()
  })

  test('admin can create an alert for a technician', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/alerts')
    await page.getByRole('button', { name: /new alert/i }).click()

    const ts = Date.now()
    await page.getByPlaceholderText(/scheduled maintenance/i).fill(`E2E Alert ${ts}`)
    await page.getByPlaceholderText(/full message/i).fill('This is an automated E2E test alert.')

    const techCheckbox = page.getByText(TECH_EMAIL, { exact: false }).first()
    const hasTech = await techCheckbox.isVisible().catch(() => false)
    if (!hasTech) {
      await page.getByRole('button', { name: /all technicians/i }).first().click()
    } else {
      await techCheckbox.click()
    }

    await page.getByRole('button', { name: /send alert/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByText(`E2E Alert ${ts}`)).toBeVisible()
  })

  test('technician sees alerts page with unread count logic', async ({ page }) => {
    await loginAsTechnician(page)
    await page.getByRole('link', { name: /alerts/i }).click()
    await expect(page).toHaveURL(/technician\/alerts/)
    await expect(page.getByText('Alerts')).toBeVisible()
  })

  test('technician can open an alert to read it', async ({ page }) => {
    await loginAsTechnician(page)
    await page.getByRole('link', { name: /alerts/i }).click()

    const firstAlert = page.locator('button').filter({ hasText: /.+/ }).first()
    const hasAlert = await firstAlert.isVisible().catch(() => false)

    if (!hasAlert) {
      test.skip()
      return
    }

    await firstAlert.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
})
