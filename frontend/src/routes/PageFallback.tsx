import { Loader2Icon } from 'lucide-react'

/** Fallback de Suspense para las rutas cargadas con React.lazy (code-splitting). */
export function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}
