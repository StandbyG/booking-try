import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useAvailabilityQuery } from '@/features/resources/hooks'
import { getApiErrorMessage } from '@/lib/api-error'
import { useCreateAvailabilityMutation, useDeleteAvailabilityMutation } from './hooks'
import { availabilityFormSchema, DAY_OF_WEEK_OPTIONS, type AvailabilityFormValues } from './schemas'

const DAY_LABEL = Object.fromEntries(DAY_OF_WEEK_OPTIONS.map((d) => [d.value, d.label]))

export function AvailabilityManager({ resourceId }: { resourceId: number }) {
  const { data: rules, isPending, isError, error } = useAvailabilityQuery(resourceId)
  const createMutation = useCreateAvailabilityMutation()
  const deleteMutation = useDeleteAvailabilityMutation()

  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilityFormSchema),
    defaultValues: { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '18:00' },
  })

  function onSubmit(values: AvailabilityFormValues) {
    createMutation.mutate(
      { resourceId, payload: values },
      {
        onSuccess: () => {
          toast.success('Disponibilidad agregada')
          form.reset(values)
        },
        onError: (err) => toast.error(getApiErrorMessage(err)),
      },
    )
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(
      { id, resourceId },
      {
        onSuccess: () => toast.success('Regla eliminada'),
        onError: (err) => toast.error(getApiErrorMessage(err)),
      },
    )
  }

  return (
    <div className="space-y-4">
      {isPending ? (
        <Skeleton className="h-16 w-full" />
      ) : isError ? (
        <p className="text-destructive">{getApiErrorMessage(error)}</p>
      ) : rules.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavia no hay reglas de disponibilidad.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {rules.map((rule) => (
            <Badge key={rule.id} variant="outline" className="gap-2 py-1.5">
              {DAY_LABEL[rule.dayOfWeek]} {rule.startTime.slice(0, 5)}-{rule.endTime.slice(0, 5)}
              <button
                type="button"
                onClick={() => handleDelete(rule.id)}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Eliminar regla"
              >
                &times;
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3">
          <FormField
            control={form.control}
            name="dayOfWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dia</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DAY_OF_WEEK_OPTIONS.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desde</FormLabel>
                <FormControl>
                  <Input type="time" className="w-28" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hasta</FormLabel>
                <FormControl>
                  <Input type="time" className="w-28" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={createMutation.isPending}>
            Agregar
          </Button>
        </form>
      </Form>
    </div>
  )
}
