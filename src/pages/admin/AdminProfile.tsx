import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../../store/authStore'
import { useUpdateProfile } from '../../features/profile/mutations'
import { useLogout } from '../../features/auth/hooks'
import { Avatar } from '../../components/ui/Avatar'
import { Icons } from '../../components/ui/Icons'

const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const inputCls = 'w-full h-10 px-3 text-sm border border-border rounded-lg bg-white text-text-base outline-none transition-all focus:border-brand-700 focus:ring-3 focus:ring-brand-700/15'

export default function AdminProfile() {
  const profile = useAuthStore((s) => s.profile)
  const { mutate, isPending, error } = useUpdateProfile()
  const logout = useLogout()
  const [isEditing, setIsEditing] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: profile?.full_name ?? '', phone: profile?.phone ?? '' },
  })

  function startEdit() {
    reset({ full_name: profile?.full_name ?? '', phone: profile?.phone ?? '' })
    setIsEditing(true)
  }

  function onSubmit(data: ProfileFormData) {
    mutate(
      { full_name: data.full_name, phone: data.phone || null },
      { onSuccess: () => setIsEditing(false) }
    )
  }

  if (!profile) return null

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-base">Profile settings</h1>
          <p className="text-sm text-text-muted mt-0.5">Manage your personal information</p>
        </div>
        {!isEditing && (
          <button
            onClick={startEdit}
            className="h-9 px-3.5 rounded-lg border border-slate-200 text-sm font-semibold text-text-base hover:bg-surface-2 transition-colors inline-flex items-center gap-1.5"
          >
            <Icons.edit size={13} />
            Edit
          </button>
        )}
      </div>

      {/* Avatar + name */}
      <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl mb-4">
        <Avatar name={profile.full_name} size={52} src={profile.avatar_url} />
        <div>
          <p className="text-[15px] font-semibold text-text-base">{profile.full_name}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[11px] font-semibold capitalize">
            {profile.role}
          </span>
        </div>
      </div>

      {/* Details / Edit form */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
        {!isEditing ? (
          <div>
            {[
              { label: 'Full name', value: profile.full_name },
              { label: 'Email address', value: profile.email },
              { label: 'Phone', value: profile.phone ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 last:border-0">
                <span className="text-xs font-semibold text-text-muted w-32 shrink-0">{label}</span>
                <span className="text-sm text-text-base text-right">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-base mb-1.5">Full name</label>
              <input {...register('full_name')} className={inputCls} />
              {errors.full_name && <p className="text-xs text-danger mt-1">{errors.full_name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-base mb-1.5">
                Phone <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <input {...register('phone')} type="tel" placeholder="+60 12 345 6789" className={inputCls} />
            </div>
            {error && <p className="text-xs text-danger">{(error as Error).message}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 h-10 rounded-lg border border-slate-200 text-sm font-semibold text-text-base hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 h-10 rounded-lg bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
              >
                {isPending ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Sign out */}
      <button
        onClick={() => void logout()}
        className="w-full h-10 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-danger hover:bg-red-50 transition-colors inline-flex items-center justify-center gap-2"
      >
        <Icons.logout size={15} color="#E11D48" />
        Sign out
      </button>
    </div>
  )
}
