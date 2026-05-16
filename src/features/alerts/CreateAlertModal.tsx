import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAlertSchema, type CreateAlertFormData } from './alertSchema'
import { useCreateAlert } from './mutations'
import { useTechnicians } from '../jobs/hooks'
import { Avatar } from '../../components/ui/Avatar'
import { Icons } from '../../components/ui/Icons'
import { Modal } from '../../components/ui/Modal'

interface CreateAlertModalProps {
  isOpen: boolean
  onClose: () => void
}

const inputCls =
  'w-full h-[38px] px-3 border border-slate-200 rounded-lg text-[13.5px] text-text-base bg-white outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all'

export function CreateAlertModal({ isOpen, onClose }: CreateAlertModalProps) {
  const { data: technicians = [] } = useTechnicians()
  const { mutate: createAlert, isPending, error } = useCreateAlert()

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateAlertFormData>({
    resolver: zodResolver(createAlertSchema),
    defaultValues: { recipient_ids: [] },
  })

  const selectedIds = watch('recipient_ids')
  const allSelected = technicians.length > 0 && selectedIds.length === technicians.length

  function toggleAll() {
    setValue('recipient_ids', allSelected ? [] : technicians.map((t) => t.id))
  }

  function onSubmit(data: CreateAlertFormData) {
    createAlert(data, {
      onSuccess: () => {
        reset({ recipient_ids: [] })
        onClose()
      },
    })
  }

  function handleClose() {
    reset({ recipient_ids: [] })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Send alert"
      subtitle="Notify one or more technicians"
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
              className="h-[38px] px-4 rounded-lg bg-brand-700 text-white text-sm font-semibold hover:bg-brand-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              <Icons.send size={14} color="white" />
              {isPending ? 'Sending…' : 'Send alert'}
            </button>
          </div>
        </>
      }
    >
      <div>
        <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
          Title <span className="text-danger">*</span>
        </label>
        <input
          {...register('title')}
          className={inputCls}
          placeholder="Short, clear headline"
        />
        {errors.title && (
          <p className="text-[11.5px] text-danger mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
          Message <span className="text-danger">*</span>
        </label>
        <textarea
          {...register('message')}
          rows={4}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13.5px] text-text-base bg-white outline-none resize-y leading-relaxed focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all"
          placeholder="What do technicians need to know?"
        />
        {errors.message && (
          <p className="text-[11.5px] text-danger mt-1">{errors.message.message}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12.5px] font-semibold text-text-base">
            Recipients ({selectedIds.length} selected){' '}
            <span className="text-danger">*</span>
          </label>
          <button
            type="button"
            onClick={toggleAll}
            className="text-[12px] font-semibold text-brand-700 hover:underline"
          >
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
        </div>

        <Controller
          name="recipient_ids"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-0.5 max-h-[200px] overflow-y-auto border border-slate-200 rounded-lg p-1.5">
              {technicians.length === 0 ? (
                <p className="text-[12px] text-text-muted text-center py-3">
                  No active technicians found.
                </p>
              ) : (
                technicians.map((tech) => {
                  const checked = field.value.includes(tech.id)
                  return (
                    <label
                      key={tech.id}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                        checked ? 'bg-brand-50' : 'hover:bg-surface-2'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          field.onChange(
                            checked
                              ? field.value.filter((id) => id !== tech.id)
                              : [...field.value, tech.id]
                          )
                        }}
                        className="w-3.5 h-3.5 accent-brand-700"
                      />
                      <Avatar name={tech.full_name} size={24} src={tech.avatar_url} />
                      <span className="text-[13px] text-text-base flex-1">
                        {tech.full_name}
                      </span>
                    </label>
                  )
                })
              )}
            </div>
          )}
        />
        {errors.recipient_ids && (
          <p className="text-[11.5px] text-danger mt-1">{errors.recipient_ids.message}</p>
        )}
      </div>
    </Modal>
  )
}
