import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { queryClient } from './lib/queryClient'
import { router } from './router'
import { OrganizationProvider } from './context/OrganizationContext'
import { TourProvider } from './features/tour/TourContext'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OrganizationProvider>
        <TourProvider>
          <RouterProvider router={router} />
        </TourProvider>
      </OrganizationProvider>
    </QueryClientProvider>
  )
}

export default App
