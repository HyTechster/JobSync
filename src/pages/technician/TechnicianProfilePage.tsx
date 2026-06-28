import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../../store/authStore'
import { useUpdateProfile } from '../../features/profile/mutations'
import { useLogout } from '../../features/auth/hooks'
import { Avatar } from '../../components/ui/Avatar'
import { Icons } from '../../components/ui/Icons'
import { OrganizationTab } from '../../features/account/OrganizationTab'

const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const inputCls = 'w-full h-[44px] px-3 border border-slate-200 rounded-xl text-[14px] text-text-base bg-white outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all'

const ROLE_LABEL = { admin: 'Administrator', technician: 'Technician', manager: 'Manager' } as const

type ProfileTab = 'profile' | 'organizations'

const PROFILE_TABS: { id: ProfileTab; label: string }[] = [
  { id: 'profile',       label: 'Profile'       },
  { id: 'organizations', label: 'Organizations' },
]

export default function TechnicianProfilePage() {
  const profile = useAuthStore((s) => s.profile)
  const { mutate, isPending, error } = useUpdateProfile()
  const logout = useLogout()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile')

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
    <div className="max-w-lg mx-auto">
      {/* Tab bar */}
      <div className="flex gap-1 px-4 pt-5 pb-0 border-b border-slate-200">
        {PROFILE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setActiveTab(tab.id); setIsEditing(false) }}
            className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-brand-700 text-brand-700'
                : 'border-transparent text-text-muted hover:text-text-base'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="px-4 pt-5 pb-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex flex-col items-start gap-0.5">
              <p className="text-[13px] font-semibold text-text-muted">
                {ROLE_LABEL[profile.role as keyof typeof ROLE_LABEL] ?? profile.role}
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={startEdit}
                className="h-[36px] px-3 rounded-xl border border-slate-300 text-[12.5px] font-semibold text-text-base hover:bg-surface-2 transition-colors inline-flex items-center gap-1.5"
              >
                <Icons.edit size={13} />
                Edit
              </button>
            )}
          </div>

          <div className="flex flex-col items-center mb-5">
            <Avatar name={profile.full_name} size={72} src={profile.avatar_url} />
            <p className="text-[18px] font-bold text-text-base mt-3">{profile.full_name}</p>
          </div>

          {!isEditing ? (
            <div className="bg-white rounded-2xl border border-slate-200 px-4">
              {[
                { icon: <Icons.user size={15} color="var(--color-brand-700)" />, label: 'Full Name', value: profile.full_name },
                { icon: <Icons.send size={15} color="var(--color-brand-700)" />, label: 'Email', value: profile.email },
                { icon: <Icons.phone size={15} color="var(--color-brand-700)" />, label: 'Phone', value: profile.phone ?? 'Not set' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">{label}</p>
                    <p className="text-[13.5px] text-text-base mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                  Full Name <span className="text-danger normal-case font-normal">*</span>
                </label>
                <input {...register('full_name')} className={inputCls} />
                {errors.full_name && <p className="text-[11.5px] text-danger mt-1">{errors.full_name.message}</p>}
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                  Phone <span className="text-text-muted font-normal normal-case">(optional)</span>
                </label>
                <input {...register('phone')} className={inputCls} type="tel" placeholder="+60 12 345 6789" />
              </div>
              {error && <p className="text-[12px] text-danger">{(error as Error).message}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setIsEditing(false)}
                  className="flex-1 h-[44px] rounded-xl border border-slate-300 text-[13.5px] font-semibold text-text-base transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isPending}
                  className="flex-1 h-[44px] rounded-xl bg-brand-700 text-white text-[13.5px] font-semibold disabled:opacity-50 transition-colors">
                  {isPending ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          <button
            onClick={() => void logout()}
            className="mt-5 w-full h-[48px] rounded-2xl border border-slate-200 bg-white text-[14px] font-semibold text-danger hover:bg-[#FFF1F2] transition-colors inline-flex items-center justify-center gap-2"
          >
            <Icons.logout size={17} color="#E11D48" />
            Sign Out
          </button>
        </div>
      )}

      {/* Organizations tab */}
      {activeTab === 'organizations' && (
        <div className="px-4 pt-5 pb-6">
          <OrganizationTab />
        </div>
      )}
    </div>
  )
}
