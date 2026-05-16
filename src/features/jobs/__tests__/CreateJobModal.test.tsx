import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateJobModal } from '../CreateJobModal'

vi.mock('../hooks', () => ({
  useTechnicians: () => ({ data: [], isLoading: false }),
}))

vi.mock('../mutations', () => ({
  useCreateJob: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  }),
}))

describe('CreateJobModal — job order form', () => {
  it('renders required form fields when open', () => {
    render(<CreateJobModal isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByPlaceholderText(/AC unit not cooling/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/describe the problem/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/brightline offices/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/jalan ampang/i)).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<CreateJobModal isOpen={false} onClose={vi.fn()} />)
    expect(screen.queryByText('New job order')).not.toBeInTheDocument()
  })

  it('shows validation errors for required fields on empty submit', async () => {
    render(<CreateJobModal isOpen={true} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /create job/i }))
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })
    expect(screen.getByText('Description is required')).toBeInTheDocument()
    expect(screen.getByText('Customer name is required')).toBeInTheDocument()
    expect(screen.getByText('Location is required')).toBeInTheDocument()
  })

  it('calls onClose when cancel is clicked', () => {
    const onClose = vi.fn()
    render(<CreateJobModal isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
