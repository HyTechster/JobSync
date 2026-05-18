import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CreateJobModal } from '../CreateJobModal'

vi.mock('../../../context/OrganizationContext', () => ({
  useOrganization: () => ({ activeOrgId: 'org-test-123' }),
}))

vi.mock('../hooks', () => ({
  useOrgTechnicians: () => ({ data: [], isLoading: false }),
}))

vi.mock('../mutations', () => ({
  useCreateJob: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  }),
}))

function renderModal(isOpen = true) {
  return render(
    <MemoryRouter>
      <CreateJobModal isOpen={isOpen} onClose={vi.fn()} />
    </MemoryRouter>
  )
}

describe('CreateJobModal — job order form', () => {
  it('renders required form fields when open', () => {
    renderModal()
    expect(screen.getByPlaceholderText(/AC unit not cooling/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/describe the problem/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/brightline offices/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/street/i)).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderModal(false)
    expect(screen.queryByText('New job order')).not.toBeInTheDocument()
  })

  it('shows validation errors for required fields on empty submit', async () => {
    renderModal()
    fireEvent.click(screen.getByRole('button', { name: /create job/i }))
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })
    expect(screen.getByText('Description is required')).toBeInTheDocument()
    expect(screen.getByText('Customer name is required')).toBeInTheDocument()
    expect(screen.getByText('Street address is required')).toBeInTheDocument()
  })

  it('calls onClose when cancel is clicked', () => {
    const onClose = vi.fn()
    render(
      <MemoryRouter>
        <CreateJobModal isOpen={true} onClose={onClose} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
