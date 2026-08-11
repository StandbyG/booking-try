import { Suspense, useState } from 'react'
import { MenuIcon } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { PageFallback } from './PageFallback'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
  )

export function AppLayout() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = (
    <>
      <NavLink to="/" end className={navLinkClass}>
        Recursos
      </NavLink>
      <NavLink to="/reservations/me" className={navLinkClass}>
        Mis reservas
      </NavLink>
      {user?.role === 'ADMIN' && (
        <NavLink to="/admin" className={navLinkClass}>
          Admin
        </NavLink>
      )}
    </>
  )

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-semibold">Booking Engine</span>
            <nav className="hidden gap-1 sm:flex">{navLinks}</nav>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <span className="text-sm text-muted-foreground">
              {user?.fullName} <span className="text-xs">({user?.role})</span>
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              Cerrar sesion
            </Button>
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Abrir menu">
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col">
              <SheetHeader>
                <SheetTitle>Booking Engine</SheetTitle>
              </SheetHeader>
              <nav
                className="flex flex-1 flex-col gap-1 px-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                {navLinks}
              </nav>
              <div className="border-t p-4">
                <p className="text-sm text-muted-foreground">
                  {user?.fullName} <span className="text-xs">({user?.role})</span>
                </p>
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    logout()
                  }}
                >
                  Cerrar sesion
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
