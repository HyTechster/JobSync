import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { Organization, OrgRole } from '../types'

export interface OrgMembership {
  id: string
  organization_id: string
  role: OrgRole
  joined_at: string
  organizations: Organization
}

interface OrganizationContextValue {
  memberships: OrgMembership[]
  activeOrg: Organization | null
  activeOrgId: string | null
  userRole: OrgRole | null
  isLoading: boolean
  setActiveOrganization: (orgId: string) => void
  refreshMemberships: () => void
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null)

const STORAGE_KEY = 'jobsync_active_org'

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const session = useAuthStore((s) => s.session)
  const isAuthLoading = useAuthStore((s) => s.isLoading)

  const {
    data: memberships = [],
    isLoading: isMembershipsLoading,
    refetch,
  } = useQuery<OrgMembership[]>({
    queryKey: ['org-memberships', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select('id, organization_id, role, joined_at, organizations(*)')
        .eq('user_id', session!.user.id)
        .order('joined_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as OrgMembership[]
    },
    enabled: !!session?.user.id && !isAuthLoading,
    staleTime: 60_000,
  })

  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY)
  )

  const activeMembership = useMemo(() => {
    if (memberships.length === 0) return null
    return memberships.find((m) => m.organization_id === activeOrgId) ?? memberships[0]
  }, [memberships, activeOrgId])

  function setActiveOrganization(orgId: string) {
    setActiveOrgIdState(orgId)
    localStorage.setItem(STORAGE_KEY, orgId)
  }

  return (
    <OrganizationContext.Provider
      value={{
        memberships,
        activeOrg: activeMembership?.organizations ?? null,
        activeOrgId: activeMembership?.organization_id ?? null,
        userRole: activeMembership?.role ?? null,
        isLoading: isAuthLoading || isMembershipsLoading,
        setActiveOrganization,
        refreshMemberships: () => { void refetch() },
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const ctx = useContext(OrganizationContext)
  if (!ctx) throw new Error('useOrganization must be used within OrganizationProvider')
  return ctx
}
