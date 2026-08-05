import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import type { Role } from '@/types'

interface ProtectedRouteProps {
  /** Si se pasa, ademas de estar autenticado el usuario debe tener este rol. */
  requiredRole?: Role
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

/** Para /login y /register: si ya hay sesion, no tiene sentido mostrarlas. */
export function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
