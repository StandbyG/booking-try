import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/api-error'
import { useResourcesQuery } from './hooks'
import { ResourceCard } from './ResourceCard'

export function ResourceListPage() {
  const { data: resources, isPending, isError, error } = useResourcesQuery()

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <p className="text-destructive">{getApiErrorMessage(error)}</p>
  }

  if (resources.length === 0) {
    return <p className="text-muted-foreground">Todavia no hay recursos disponibles.</p>
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Recursos disponibles</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  )
}
