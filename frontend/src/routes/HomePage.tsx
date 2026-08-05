import { useAuthStore } from '@/store/auth.store'

/** Placeholder: el punto 4 lo reemplaza por el listado real de resources. */
export function HomePage() {
  const user = useAuthStore((state) => state.user)

  return (
    <div>
      <h1 className="text-xl font-semibold">Bienvenido, {user?.fullName}</h1>
      <p className="mt-2 text-muted-foreground">
        Aca va a ir el listado de recursos disponibles.
      </p>
    </div>
  )
}
