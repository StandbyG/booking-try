import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/api-error'
import { useResourceQuery } from '@/features/resources/hooks'
import { AvailabilityManager } from './AvailabilityManager'
import { ResourceFormDialog } from './ResourceFormDialog'
import { ResourceReservationsTable } from './ResourceReservationsTable'

export function AdminResourceDetailPage() {
  const params = useParams<{ id: string }>()
  const resourceId = Number(params.id)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: resource, isPending, isError, error } = useResourceQuery(resourceId)

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (isError) {
    return <p className="text-destructive">{getApiErrorMessage(error)}</p>
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold">{resource.name}</h1>
            {resource.category && <Badge variant="secondary">{resource.category}</Badge>}
            <Badge variant={resource.active ? 'outline' : 'secondary'}>
              {resource.active ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="self-start sm:self-auto"
            onClick={() => setDialogOpen(true)}
          >
            Editar
          </Button>
        </div>
        {resource.description && (
          <p className="mt-1 text-sm text-muted-foreground">{resource.description}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Slots de {resource.slotDurationMinutes} min · cancelacion con{' '}
          {resource.cancellationWindowHours}h de anticipacion
        </p>
      </div>

      <section>
        <h2 className="mb-3 font-medium">Disponibilidad</h2>
        <AvailabilityManager resourceId={resourceId} />
      </section>

      <section>
        <h2 className="mb-3 font-medium">Reservas</h2>
        <ResourceReservationsTable resourceId={resourceId} />
      </section>

      <ResourceFormDialog resource={resource} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
