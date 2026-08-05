import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ResourceResponse } from '@/types'

export function ResourceCard({ resource }: { resource: ResourceResponse }) {
  return (
    <Link to={`/resources/${resource.id}`}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle>{resource.name}</CardTitle>
            {resource.category && <Badge variant="secondary">{resource.category}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {resource.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{resource.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Slots de {resource.slotDurationMinutes} min · cancelacion con{' '}
            {resource.cancellationWindowHours}h de anticipacion
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
