import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { JobSheetDetailModal } from '../JobSheetDetailModal'
import type { JobSheetWithDetail } from '../hooks'

// ── mocks ─────────────────────────────────────────────────────────────────

vi.mock('../JobSheetPrintView', () => ({
  JobSheetPrintView: () => <div data-testid="print-view" />,
}))

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({ getPublicUrl: (p: string) => ({ data: { publicUrl: `https://cdn.example.com/${p}` } }) }),
    },
  },
}))

vi.mock('../../../hooks/useDateFormatter', () => ({
  useDateFormatter: () => ({
    fmtDateTime: (iso: string) => new Date(iso).toLocaleString('en-MY'),
  }),
}))

vi.mock('../../../context/OrganizationContext', () => ({
  useOrganization: () => ({ activeOrg: { id: 'org-1', name: 'Test Corp' }, activeOrgId: 'org-1' }),
}))

// ── fixture ───────────────────────────────────────────────────────────────

const SHEET: JobSheetWithDetail = {
  id: 'sheet-001',
  job_order_id: 'job-001',
  job_title: 'CCTV Maintenance',
  organization_id: 'org-1',
  sheet_number: 42,
  technician_id: 'tech-001',
  work_performed: 'Replaced faulty power supply and cleaned lenses.',
  time_spent_minutes: 90,
  notes: 'Follow up in 3 months.',
  submitted_at: '2026-06-15T10:00:00Z',
  customer_name: 'ABC Corp',
  customer_phone: '0123456789',
  customer_email: null,
  job_location: 'Level 3, Menara ABC',
  job_description: null,
  job_type: 'cctv',
  job_date: '2026-06-15',
  time_in: '09:00',
  time_out: '10:30',
  service_description: null,
  total_amount: 350,
  additional_technician_names: null,
  customer_signature_url: null,
  technician_signature_url: null,
  job_orders: {
    id: 'job-001',
    title: 'CCTV Maintenance',
    status: 'completed',
    customer_name: 'ABC Corp',
    customer_phone: '0123456789',
    location: 'Level 3, Menara ABC',
    priority: 'high',
    scheduled_date: '2026-06-15',
    scheduled_time: null,
    description: null,
  },
  profiles: { full_name: 'Ali Hassan', display_name: null, avatar_url: null },
  attachments: [],
}

// ── tests ─────────────────────────────────────────────────────────────────

describe('JobSheetDetailModal', () => {
  let printSpy: ReturnType<typeof vi.fn>
  let addEventSpy: ReturnType<typeof vi.fn>
  let removeEventSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    printSpy      = vi.fn()
    addEventSpy   = vi.fn()
    removeEventSpy = vi.fn()
    vi.stubGlobal('print', printSpy)
    vi.stubGlobal('addEventListener', addEventSpy)
    vi.stubGlobal('removeEventListener', removeEventSpy)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the job sheet title and sheet number', () => {
    render(<JobSheetDetailModal sheet={SHEET} onClose={vi.fn()} />)
    expect(screen.getByText('CCTV Maintenance')).toBeInTheDocument()
    expect(screen.getByText('#42')).toBeInTheDocument()
  })

  it('renders the technician name', () => {
    render(<JobSheetDetailModal sheet={SHEET} onClose={vi.fn()} />)
    expect(screen.getByText('Ali Hassan')).toBeInTheDocument()
  })

  it('renders work performed text', () => {
    render(<JobSheetDetailModal sheet={SHEET} onClose={vi.fn()} />)
    expect(screen.getByText(/Replaced faulty power supply/i)).toBeInTheDocument()
  })

  it('renders the notes section when notes exist', () => {
    render(<JobSheetDetailModal sheet={SHEET} onClose={vi.fn()} />)
    expect(screen.getByText('Follow up in 3 months.')).toBeInTheDocument()
  })

  it('renders the Download as PDF button', () => {
    render(<JobSheetDetailModal sheet={SHEET} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: /download as pdf/i })).toBeInTheDocument()
  })

  it('renders the print hint text', () => {
    render(<JobSheetDetailModal sheet={SHEET} onClose={vi.fn()} />)
    expect(screen.getByText(/save as pdf/i)).toBeInTheDocument()
  })

  it('does not render the print view initially', () => {
    render(<JobSheetDetailModal sheet={SHEET} onClose={vi.fn()} />)
    expect(screen.queryByTestId('print-view')).not.toBeInTheDocument()
  })

  it('mounts the print view and triggers window.print on button click', async () => {
    render(<JobSheetDetailModal sheet={SHEET} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /download as pdf/i }))

    // Print view should be mounted immediately after state update
    await waitFor(() => {
      expect(screen.getByTestId('print-view')).toBeInTheDocument()
    })

    // window.print is called inside double-rAF; wait for it
    await waitFor(() => {
      expect(printSpy).toHaveBeenCalledOnce()
    })
  })

  it('sets document.title to JobSheet-<num>-<date> before printing', async () => {
    render(<JobSheetDetailModal sheet={SHEET} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /download as pdf/i }))

    // SHEET has sheet_number: 42 and job_date: '2026-06-15'
    await waitFor(() => {
      expect(document.title).toBe('JobSheet-000042-20260615')
    })
  })

  it('disables the button while printing is in progress', async () => {
    render(<JobSheetDetailModal sheet={SHEET} onClose={vi.fn()} />)
    const btn = screen.getByRole('button', { name: /download as pdf/i })
    fireEvent.click(btn)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /preparing pdf/i })).toBeDisabled()
    })
  })

  it('renders nothing when sheet prop is null', () => {
    const { container } = render(<JobSheetDetailModal sheet={null} onClose={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('does not render photos section when there are no attachments', () => {
    render(<JobSheetDetailModal sheet={SHEET} onClose={vi.fn()} />)
    expect(screen.queryByText(/photos/i)).not.toBeInTheDocument()
  })

  it('renders site photo thumbnails when attachments exist', () => {
    const sheetWithPhotos: JobSheetWithDetail = {
      ...SHEET,
      attachments: [
        { id: 'att-1', storage_path: 'org-1/job-1/sheet-id/photos/photo.jpg', file_name: 'photo.jpg', file_size: 10240, mime_type: 'image/jpeg' },
      ],
    }
    render(<JobSheetDetailModal sheet={sheetWithPhotos} onClose={vi.fn()} />)
    expect(screen.getByText('Site Photos (1)')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'photo.jpg' })).toBeInTheDocument()
  })

  it('renders payment evidence in its own section', () => {
    const sheetWithPayment: JobSheetWithDetail = {
      ...SHEET,
      attachments: [
        { id: 'att-2', storage_path: 'org-1/job-1/sheet-id/payment/receipt.jpg', file_name: 'receipt.jpg', file_size: 8192, mime_type: 'image/jpeg' },
      ],
    }
    render(<JobSheetDetailModal sheet={sheetWithPayment} onClose={vi.fn()} />)
    expect(screen.getByText('Payment Evidence')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'receipt.jpg' })).toBeInTheDocument()
  })

  it('calls onClose when the modal close button is clicked', () => {
    const onClose = vi.fn()
    render(<JobSheetDetailModal sheet={SHEET} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
