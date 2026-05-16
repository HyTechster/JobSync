import type { Page } from '@playwright/test'

export const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    ?? 'admin@jobsync.test'
export const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin123456'
export const TECH_EMAIL     = process.env.TEST_TECH_EMAIL     ?? 'tech@jobsync.test'
export const TECH_PASSWORD  = process.env.TEST_TECH_PASSWORD  ?? 'tech123456'

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
}

export async function loginAsAdmin(page: Page) {
  await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD)
  await page.waitForURL('**/admin/dashboard')
}

export async function loginAsTechnician(page: Page) {
  await loginAs(page, TECH_EMAIL, TECH_PASSWORD)
  await page.waitForURL('**/technician/jobs')
}
