import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { queryClient } from './lib/queryClient'
import { router } from './router'
import { OrganizationProvider } from './context/OrganizationContext'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OrganizationProvider>
        <RouterProvider router={router} />
      </OrganizationProvider>
    </QueryClientProvider>
  )
}

export default App
