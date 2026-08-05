import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { AppLayout } from './AppLayout'
import { AuthLayout } from './AuthLayout'
import { HomePage } from './HomePage'
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
        children: [{ path: '/', element: <HomePage /> }],
      },
    ],
  },
])
