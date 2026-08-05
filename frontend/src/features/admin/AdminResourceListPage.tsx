import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getApiErrorMessage } from '@/lib/api-error'
import type { ResourceResponse } from '@/types'
import { useAllResourcesQuery, useDeactivateResourceMutation } from './hooks'
import { ResourceFormDialog } from './ResourceFormDialog'

export function AdminResourceListPage() {
  const { data: resources, isPending, isError, error } = useAllResourcesQuery()
  const deactivateMutation = useDeactivateResourceMutation()
  const [editingResource, setEditingResource] = useState<ResourceResponse | undefined>(undefined)
  const [dialogOpen, setDialogOpen] = useState(false)

  function openCreateDialog() {
    setEditingResource(undefined)
    setDialogOpen(true)
  }

  function openEditDialog(resource: ResourceResponse) {
    setEditingResource(resource)
    setDialogOpen(true)
  }

  function handleDeactivate(resource: ResourceResponse) {
    deactivateMutation.mutate(resource.id, {
      onSuccess: () => toast.success('Recurso desactivado'),
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  if (isPending) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <p className="text-destructive">{getApiErrorMessage(error)}</p>
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Recursos (admin)</h1>
        <Button onClick={openCreateDialog}>+ Nuevo recurso</Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>
                  <Link to={`/admin/resources/${resource.id}`} className="font-medium hover:underline">
                    {resource.name}
                  </Link>
                </TableCell>
                <TableCell>{resource.category ?? '-'}</TableCell>
                <TableCell>{resource.slotDurationMinutes} min</TableCell>
                <TableCell>
                  <Badge variant={resource.active ? 'outline' : 'secondary'}>
                    {resource.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(resource)}>
                      Editar
                    </Button>
                    {resource.active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeactivate(resource)}
                        disabled={deactivateMutation.isPending}
                      >
                        Desactivar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ResourceFormDialog
        resource={editingResource}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
