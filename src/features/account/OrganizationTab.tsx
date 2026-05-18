import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrganization, type OrgMembership } from '../../context/OrganizationContext'
import { useAuthStore } from '../../store/authStore'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Modal } from '../../components/ui/Modal'
import { useLeaveOrganization, useDeleteOrganization } from './mutations'
import type { OrgRole } from '../../types'

const ORG_COLORS = [
  'bg-brand-700',
  'bg-violet-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-cyan-600',
]

const ROLE_BADGE: Record<OrgRole, string> = {
  admin:      'bg-brand-50 text-brand-700',
  manager:    'bg-violet-100 text-violet-700',
  technician: 'bg-emerald-100 text-emerald-700',
}

const ROLE_LABEL: Record<OrgRole, string> = {
  admin:      'Admin',
  manager:    'Manager',
  technician: 'Technician',
}

function OrgAvatar({ name, index }: { name: string; index: number }) {
  const bg = ORG_COLORS[index % ORG_COLORS.length]
  return (
    <div className={`w-11 h-11 rounded-xl ${bg} text-white text-sm font-bold flex items-center justify-center flex-shrink-0`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  )
}

function formatJoined(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export function OrganizationTab() {
  const navigate  = useNavigate()
  const { memberships, isLoading } = useOrganization()
  const currentUserId = useAuthStore((s) => s.profile?.id)

  const leaveOrg  = useLeaveOrganization()
  const deleteOrg = useDeleteOrganization()

  // Leave flow
  const [pendingLeave, setPendingLeave]   = useState<OrgMembership | null>(null)

  // Close org flow — two-step
  const [closeTarget, setCloseTarget]     = useState<OrgMembership | null>(null)
  const [closeStep, setCloseStep]         = useState<'warn' | 'input' | null>(null)
  const [closeInput, setCloseInput]       = useState('')

  function startLeave(m: OrgMembership) { setPendingLeave(m) }

  function confirmLeave() {
    if (!pendingLeave) return
    const isOwner = pendingLeave.organizations.owner_id === currentUserId
    leaveOrg.mutate({ orgId: pendingLeave.organization_id, isOwner }, {
      onSuccess: () => {
        setPendingLeave(null)
        navigate('/dashboard/select-organization', { replace: true })
      },
      onError: () => setPendingLeave(null),
    })
  }

  function startClose(m: OrgMembership) {
    setCloseTarget(m)
    setCloseStep('warn')
    setCloseInput('')
  }

  function confirmCloseStep1() {
    setCloseStep('input')
  }

  function confirmCloseStep2() {
    if (!closeTarget || closeInput !== closeTarget.organizations.name) return
    deleteOrg.mutate({ orgId: closeTarget.organization_id }, {
      onSuccess: () => {
        setCloseTarget(null)
        setCloseStep(null)
        setCloseInput('')
        navigate('/dashboard/select-organization', { replace: true })
      },
    })
  }

  function cancelClose() {
    setCloseTarget(null)
    setCloseStep(null)
    setCloseInput('')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-text-base">Your organizations</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Organizations you are a member of
          </p>
        </div>

        {memberships.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl px-6 py-10 flex flex-col items-center gap-2 text-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p className="text-sm font-medium text-text-muted">No organizations</p>
            <p className="text-xs text-text-muted">You are not a member of any organization yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {memberships.map((m, i) => {
              const isOwner = m.organizations.owner_id === currentUserId
              return (
                <div key={m.organization_id} className="flex items-center gap-4 px-5 py-4">
                  <OrgAvatar name={m.organizations.name} index={i} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-semibold text-text-base truncate leading-tight">
                        {m.organizations.name}
                      </span>
                      {isOwner && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded leading-none">
                          Owner
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded ${ROLE_BADGE[m.role]}`}>
                        {ROLE_LABEL[m.role]}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        Joined {formatJoined(m.joined_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isOwner ? (
                      <button
                        type="button"
                        onClick={() => startClose(m)}
                        className="h-8 px-3 rounded-lg border border-red-200 text-[12px] font-semibold text-danger hover:bg-red-50 transition-colors"
                      >
                        Close org
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startLeave(m)}
                        className="h-8 px-3 rounded-lg border border-slate-200 text-[12px] font-semibold text-text-muted hover:bg-surface-2 hover:text-danger hover:border-red-200 transition-colors"
                      >
                        Step down
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Leave confirmation */}
      <ConfirmDialog
        isOpen={!!pendingLeave}
        title={`Step down from ${pendingLeave?.organizations.name ?? ''}?`}
        message="You will lose access to all jobs, alerts, and data in this organization. You would need to be re-invited to rejoin."
        confirmLabel="Step down"
        variant="warning"
        isPending={leaveOrg.isPending}
        onConfirm={confirmLeave}
        onCancel={() => setPendingLeave(null)}
      />

      {/* Close org — step 1: warning */}
      <ConfirmDialog
        isOpen={closeStep === 'warn'}
        title={`Close "${closeTarget?.organizations.name ?? ''}"?`}
        message="This will permanently remove all members and delete the organization. This action cannot be undone. You will need to confirm the organization name next."
        confirmLabel="Continue"
        variant="danger"
        isPending={false}
        onConfirm={confirmCloseStep1}
        onCancel={cancelClose}
      />

      {/* Close org — step 2: type org name */}
      <Modal
        isOpen={closeStep === 'input'}
        onClose={cancelClose}
        title="Final confirmation"
        subtitle={`Type the organization name to permanently close it`}
        maxWidth="max-w-sm"
        footer={
          <>
            <button
              type="button"
              onClick={cancelClose}
              className="h-9 px-4 border border-slate-200 text-sm font-semibold text-text-base rounded-lg hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmCloseStep2}
              disabled={closeInput !== (closeTarget?.organizations.name ?? '') || deleteOrg.isPending}
              className="h-9 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              {deleteOrg.isPending && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Delete permanently
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-3 -mt-2">
          <p className="text-sm text-text-muted">
            Type{' '}
            <strong className="text-text-base font-semibold">
              {closeTarget?.organizations.name}
            </strong>{' '}
            to confirm.
          </p>
          <input
            type="text"
            value={closeInput}
            onChange={(e) => setCloseInput(e.target.value)}
            placeholder={closeTarget?.organizations.name}
            className="w-full h-10 px-3 text-sm border border-red-300 rounded-lg outline-none focus:border-danger focus:ring-[3px] focus:ring-danger/10 transition-all"
            autoFocus
          />
          {deleteOrg.isError && (
            <p className="text-xs text-danger">
              {deleteOrg.error instanceof Error ? deleteOrg.error.message : 'Something went wrong.'}
            </p>
          )}
        </div>
      </Modal>
    </>
  )
}
