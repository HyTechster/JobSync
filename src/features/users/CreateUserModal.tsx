import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserSchema, type CreateUserFormData } from './userSchema'
import { useCreateUser } from './mutations'
import { Modal } from '../../components/ui/Modal'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
}

const inputCls =
  'w-full h-[38px] px-3 border border-slate-200 rounded-lg text-[13.5px] text-text-base bg-white outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all'

export function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const { mutate: createUser, isPending, error } = useCreateUser()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'technician' },
  })

  function onSubmit(data: CreateUserFormData) {
    createUser(data, {
      onSuccess: () => {
        reset({ role: 'technician' })
        onClose()
      },
    })
  }

  function handleClose() {
    reset({ role: 'technician' })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add staff account"
      subtitle="Create a new admin or technician login"
      maxWidth="max-w-lg"
      footer={
        <>
          <p className="text-[12px]">
            {error ? <span className="text-danger">{(error as Error).message}</span> : null}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="h-[38px] px-4 rounded-lg border border-slate-300 text-sm font-semibold text-text-base hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isPending}
              className="h-[38px] px-4 rounded-lg bg-brand-700 text-white text-sm font-semibold hover:bg-brand-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Creating…' : 'Create account'}
            </button>
          </div>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
            Full name <span className="text-danger">*</span>
          </label>
          <input {...register('full_name')} className={inputCls} placeholder="e.g. Aisha Rahman" />
          {errors.full_name && (
            <p className="text-[11.5px] text-danger mt-1">{errors.full_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
            Email <span className="text-danger">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            className={inputCls}
            placeholder="aisha@example.com"
          />
          {errors.email && (
            <p className="text-[11.5px] text-danger mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">Phone</label>
            <input
              {...register('phone')}
              type="tel"
              className={inputCls}
              placeholder="+60 12-345 6789"
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
              Role <span className="text-danger">*</span>
            </label>
            <select
              {...register('role')}
              className="w-full h-[38px] px-3 border border-slate-200 rounded-lg text-[13.5px] text-text-base bg-white outline-none focus:border-brand-700 transition-all appearance-none"
            >
              <option value="technician">Technician</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
            Temporary password <span className="text-danger">*</span>
          </label>
          <input
            {...register('password')}
            type="password"
            className={inputCls}
            placeholder="Min 8 characters"
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="text-[11.5px] text-danger mt-1">{errors.password.message}</p>
          )}
          <p className="text-[11.5px] text-text-muted mt-1">
            The user can change their password after first login.
          </p>
        </div>
      </div>
    </Modal>
  )
}
