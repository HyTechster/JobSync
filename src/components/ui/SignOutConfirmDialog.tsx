import { ConfirmDialog } from './ConfirmDialog'

interface SignOutConfirmDialogProps {
  isOpen: boolean
  isPending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function SignOutConfirmDialog({ isOpen, isPending, onConfirm, onCancel }: SignOutConfirmDialogProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title="Sign out?"
      message="You'll be signed out of this device and redirected to the login page."
      confirmLabel="Sign out"
      variant="danger"
      isPending={isPending}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
