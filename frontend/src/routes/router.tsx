import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { AuthLayout } from './AuthLayout'
import { NotFoundPage } from './NotFoundPage'
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute'

// Code-splitting por ruta: cada feature (sobre todo admin, que solo cargan
// los admins) queda en su propio chunk en vez de ir todo en el bundle
// inicial. Los layouts envuelven su <Outlet/> en <Suspense> (ver
// AppLayout.tsx / AuthLayout.tsx).
const LoginPage = lazy(() =>
  import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('@/features/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
const ResourceListPage = lazy(() =>
  import('@/features/resources/ResourceListPage').then((m) => ({ default: m.ResourceListPage })),
)
const ResourceDetailPage = lazy(() =>
  import('@/features/resources/ResourceDetailPage').then((m) => ({
    default: m.ResourceDetailPage,
  })),
)
const MyReservationsPage = lazy(() =>
  import('@/features/reservations/MyReservationsPage').then((m) => ({
    default: m.MyReservationsPage,
  })),
)
const AdminResourceListPage = lazy(() =>
  import('@/features/admin/AdminResourceListPage').then((m) => ({
    default: m.AdminResourceListPage,
  })),
)
const AdminResourceDetailPage = lazy(() =>
  import('@/features/admin/AdminResourceDetailPage').then((m) => ({
    default: m.AdminResourceDetailPage,
  })),
)

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
          {
            element: <ProtectedRoute requiredRole="ADMIN" />,
            children: [
              { path: '/admin', element: <AdminResourceListPage /> },
              { path: '/admin/resources/:id', element: <AdminResourceDetailPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
