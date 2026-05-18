import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SubmitJobSheetPage from '../SubmitJobSheetPage'

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useParams:       () => ({ jobId: 'job-test-123' }),
    useNavigate:     () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  }
})

vi.mock('../../../context/OrganizationContext', () => ({
  useOrganization: () => ({ activeOrgId: 'org-test-123' }),
}))

vi.mock('../../../store/authStore', () => ({
  useAuthStore: (selector: (s: { session: { user: { id: string } } }) => unknown) =>
    selector({ session: { user: { id: 'user-test-123' } } }),
}))

vi.mock('../../../features/jobs/hooks', () => ({
  useJob:            () => ({ data: { id: 'job-test-123', title: 'Fix CCTV at Level 3' } }),
  useOrgTechnicians: () => ({ data: [] }),
}))

vi.mock('../../../features/job-sheets/mutations', () => ({
  useSubmitFullSheet: () => ({ mutate: vi.fn(), isPending: false, error: null }),
}))

vi.mock('../../../hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => true,
}))

vi.mock('../../../offline/db', () => ({
  offlineDb: {
    jobSheets:   { add: vi.fn() },
    draftSheets: {
      get:    vi.fn().mockResolvedValue(undefined),
      add:    vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    attachments: { add: vi.fn() },
  },
}))

vi.stubGlobal('URL', {
  createObjectURL: vi.fn(() => 'blob:mock-url'),
  revokeObjectURL: vi.fn(),
})

describe('SubmitJobSheetPage — job sheet form', () => {
  it('renders the work performed textarea', () => {
    render(<SubmitJobSheetPage />)
    expect(screen.getByPlaceholderText(/describe all work carried out/i)).toBeInTheDocument()
  })

  it('renders the time spent fields', () => {
    render(<SubmitJobSheetPage />)
    expect(screen.getByLabelText('Hours')).toBeInTheDocument()
    expect(screen.getByLabelText('Minutes')).toBeInTheDocument()
  })

  it('shows validation error when submitting with empty work performed', async () => {
    render(<SubmitJobSheetPage />)
    fireEvent.click(screen.getByRole('button', { name: /submit job sheet/i }))
    await waitFor(() => {
      expect(screen.getByText('Work performed is required')).toBeInTheDocument()
    })
  })

  it('shows time validation error when hours and minutes are both 0', async () => {
    render(<SubmitJobSheetPage />)
    fireEvent.change(screen.getByPlaceholderText(/describe all work carried out/i), {
      target: { value: 'Replaced faulty cable' },
    })
    fireEvent.click(screen.getByRole('button', { name: /submit job sheet/i }))
    await waitFor(() => {
      expect(screen.getByText('Enter at least 1 minute')).toBeInTheDocument()
    })
  })
})
