import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Profile } from '../../types'
import { useAuth } from '../auth/hooks'
import { useUpdateProfile } from './hooks'
import { LinkedEmailsSection } from './LinkedEmailsSection'

const schema = z.object({
  full_name:    z.string().min(2, 'Full name must be at least 2 characters'),
  display_name: z.string().optional(),
  gender:       z.enum(['male', 'female', 'other', 'prefer_not_to_say', '']).optional(),
  country:      z.string().optional(),
  phone:        z.string().optional(),
})
type FormData = z.infer<typeof schema>

const GENDER_OPTIONS = [
  { value: '',                  label: 'Prefer not to say' },
  { value: 'male',              label: 'Male' },
  { value: 'female',            label: 'Female' },
  { value: 'other',             label: 'Other' },
]

const inputCls = 'w-full h-10 px-3 text-sm border border-border rounded-lg bg-white text-text-base placeholder:text-text-subtle outline-none transition-all focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10'
const disabledCls = `${inputCls} bg-surface-2 text-text-muted cursor-not-allowed`

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-text-base mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  )
}

export function ProfileTab() {
  const { profile } = useAuth()
  const updateProfile = useUpdateProfile()

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name:    profile?.full_name ?? '',
      display_name: profile?.display_name ?? '',
      gender:       profile?.gender ?? '',
      country:      profile?.country ?? '',
      phone:        profile?.phone ?? '',
    },
  })

  function onSubmit(data: FormData) {
    updateProfile.mutate({
      full_name:    data.full_name,
      display_name: data.display_name || null,
      gender:       (data.gender as Profile['gender']) || null,
      country:      data.country || null,
      phone:        data.phone || null,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-base">Personal information</h2>
          <p className="text-xs text-text-muted mt-0.5">Update your name and personal details</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full name" id="full_name" error={errors.full_name?.message}>
              <input id="full_name" type="text" {...register('full_name')} className={inputCls} />
            </Field>
            <Field label="Display name" id="display_name">
              <input id="display_name" type="text" placeholder="How others see you" {...register('display_name')} className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Gender" id="gender">
              <select id="gender" {...register('gender')} className={inputCls}>
                {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Country" id="country">
              <input id="country" type="text" placeholder="e.g. Malaysia" {...register('country')} className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone number" id="phone">
              <input id="phone" type="tel" placeholder="+60 12 345 6789" {...register('phone')} className={inputCls} />
            </Field>
          </div>

          <div className="h-px bg-border my-1" />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Language" id="lang">
              <input id="lang" type="text" value="English" disabled className={disabledCls} readOnly />
            </Field>
            <Field label="Timezone" id="tz">
              <input id="tz" type="text" value="GMT+8:00 — Malaysia Standard Time" disabled className={disabledCls} readOnly />
            </Field>
          </div>

          {updateProfile.isError && (
            <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {updateProfile.error instanceof Error ? updateProfile.error.message : 'Failed to save changes'}
            </p>
          )}
          {updateProfile.isSuccess && (
            <p className="text-sm text-success bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              Profile updated successfully
            </p>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={!isDirty || updateProfile.isPending}
              className="h-9 px-5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              {updateProfile.isPending && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </section>

      <LinkedEmailsSection />
    </div>
  )
}
