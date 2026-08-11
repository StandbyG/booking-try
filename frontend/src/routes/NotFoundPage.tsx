import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-4 text-center">
      <h1 className="text-2xl font-semibold">Pagina no encontrada</h1>
      <p className="text-muted-foreground">La URL a la que intentaste acceder no existe.</p>
      <Button asChild>
        <Link to="/">Volver al inicio</Link>
      </Button>
    </div>
  )
}
