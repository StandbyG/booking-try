import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { applyValidationErrors, getApiErrorMessage } from '@/lib/api-error'
import type { ResourceResponse } from '@/types'
import { useCreateResourceMutation, useUpdateResourceMutation } from './hooks'
import { resourceFormSchema, type ResourceFormValues } from './schemas'

interface ResourceFormDialogProps {
  resource?: ResourceResponse
  open: boolean
  onOpenChange: (open: boolean) => void
}

const EMPTY_VALUES: ResourceFormValues = {
  name: '',
  description: '',
  category: '',
  slotDurationMinutes: 60,
  cancellationWindowHours: 24,
  active: true,
}

export function ResourceFormDialog({ resource, open, onOpenChange }: ResourceFormDialogProps) {
  const isEditing = resource !== undefined
  const createMutation = useCreateResourceMutation()
  const updateMutation = useUpdateResourceMutation()
  const mutation = isEditing ? updateMutation : createMutation

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (open) {
      form.reset(
        resource
          ? {
              name: resource.name,
              description: resource.description ?? '',
              category: resource.category ?? '',
              slotDurationMinutes: resource.slotDurationMinutes,
              cancellationWindowHours: resource.cancellationWindowHours,
              active: resource.active,
            }
          : EMPTY_VALUES,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, resource])

  function onSubmit(values: ResourceFormValues) {
    const onSuccess = () => {
      toast.success(isEditing ? 'Recurso actualizado' : 'Recurso creado')
      onOpenChange(false)
    }
    const onError = (error: unknown) => {
      const handledByForm = applyValidationErrors(error, form.setError)
      if (!handledByForm) toast.error(getApiErrorMessage(error))
    }

    if (isEditing) {
      updateMutation.mutate({ id: resource.id, payload: values }, { onSuccess, onError })
    } else {
      createMutation.mutate(values, { onSuccess, onError })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar recurso' : 'Nuevo recurso'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="CANCHA, CONSULTORIO, ..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripcion</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="slotDurationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duracion del slot (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cancellationWindowHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ventana de cancelacion (h)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {isEditing && (
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <FormLabel className="!mt-0">Activo</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
