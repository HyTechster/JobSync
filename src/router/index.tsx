import { createBrowserRouter, Navigate } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <div>Login — Phase 2</div>,
  },
  {
    path: '/admin/*',
    element: <div>Admin — Phase 3</div>,
  },
  {
    path: '/technician/*',
    element: <div>Technician — Phase 8</div>,
  },
])
