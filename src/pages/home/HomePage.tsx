import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks'
import { useOrganization } from '../../context/OrganizationContext'
import { HomeNav } from './HomeNav'
import { HomeHero } from './HomeHero'
import { HomeFeatures } from './HomeFeatures'
import { HomeHowItWorks } from './HomeHowItWorks'
import { HomeSplitSections } from './HomeSplitSections'
import { HomeIndustries } from './HomeIndustries'
import { HomeCTA } from './HomeCTA'
import { HomeFooter } from './HomeFooter'

export default function HomePage() {
  const { session, isLoading: isAuthLoading } = useAuth()
  const { isLoading: isOrgLoading } = useOrganization()
  const navigate = useNavigate()
  const isLoading = isAuthLoading || isOrgLoading

  // Already signed in — skip the marketing page and go straight to the app.
  useEffect(() => {
    if (isLoading || !session) return
    navigate('/dashboard/select-organization', { replace: true })
  }, [isLoading, session, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-2">
        <span className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-700 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main>
      <HomeNav />
      <HomeHero />
      <HomeFeatures />
      <HomeHowItWorks />
      <HomeSplitSections />
      <HomeIndustries />
      <HomeCTA />
      <HomeFooter />
    </main>
  )
}
