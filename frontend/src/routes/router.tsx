import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { MyReservationsPage } from '@/features/reservations/MyReservationsPage'
import { ResourceDetailPage } from '@/features/resources/ResourceDetailPage'
import { ResourceListPage } from '@/features/resources/ResourceListPage'
import { AppLayout } from './AppLayout'
import { AuthLayout } from './AuthLayout'
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute'

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <ResourceListPage /> },
          { path: '/resources/:id', element: <ResourceDetailPage /> },
          { path: '/reservations/me', element: <MyReservationsPage /> },
        ],
      },
    ],
  },
])
