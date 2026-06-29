import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SubmitJobSheetPage from '../SubmitJobSheetPage'

// Stable object reference — avoids infinite useEffect loop caused by the mock
// returning a new object reference every render (which React treats as a change)
const MOCK_JOB = vi.hoisted(() => ({
  id: 'job-test-123',
  title: 'Fix CCTV at Level 3',
  customer_name: '',
  customer_phone: null,
  customer_email: null,
  location: '',
  description: '',
  job_type: '',
  scheduled_date: '',
  scheduled_time: null,
}))

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
  useJob:            () => ({ data: MOCK_JOB }),
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
    jobSheets:         { add: vi.fn() },
    draftSheets:       {
      get:    vi.fn().mockResolvedValue(undefined),
      add:    vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    attachments:       { add: vi.fn() },
    pendingFullSheets: { add: vi.fn() },
  },
}))

vi.mock('../../../components/ui/SignaturePad', () => ({
  SignaturePad: () => null,
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

  it('renders the time-in and time-out fields', () => {
    const { container } = render(<SubmitJobSheetPage />)
    expect(container.querySelector('input[name="time_in"]')).toBeInTheDocument()
    expect(container.querySelector('input[name="time_out"]')).toBeInTheDocument()
  })

  it('shows validation error when submitting with empty work performed', async () => {
    render(<SubmitJobSheetPage />)
    fireEvent.click(screen.getByRole('button', { name: /submit sheet/i }))
    await waitFor(() => {
      expect(screen.getByText('Work performed is required')).toBeInTheDocument()
    })
  })

  it('shows payment amount validation error when total_amount is empty', async () => {
    render(<SubmitJobSheetPage />)
    fireEvent.change(screen.getByPlaceholderText(/describe all work carried out/i), {
      target: { value: 'Replaced faulty cable' },
    })
    fireEvent.click(screen.getByRole('button', { name: /submit sheet/i }))
    await waitFor(() => {
      expect(screen.getByText('Payment amount is required')).toBeInTheDocument()
    })
  })
})
