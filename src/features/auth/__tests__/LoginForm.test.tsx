import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LoginForm } from '../LoginForm'

const mockMutate = vi.fn()

vi.mock('../hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../hooks')>()
  return {
    ...actual,
    useLogin: () => ({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    }),
  }
})

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  )
}

describe('LoginForm', () => {
  beforeEach(() => {
    mockMutate.mockClear()
  })

  it('renders email and password fields', () => {
    renderLoginForm()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('renders role tab buttons', () => {
    renderLoginForm()
    expect(screen.getByRole('button', { name: /administrator/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /technician/i })).toBeInTheDocument()
  })

  it('shows email validation error when submitting empty form', async () => {
    renderLoginForm()
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText('Enter a valid email address')).toBeInTheDocument()
    })
  })

  it('shows password required error when email is valid but password is empty', async () => {
    renderLoginForm()
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@company.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('calls mutate with correct data when form is valid', async () => {
    renderLoginForm()
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@company.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'mypassword' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'admin@company.com',
        password: 'mypassword',
      })
    })
  })
})
