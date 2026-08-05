import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { applyValidationErrors, getApiErrorMessage } from '@/lib/api-error'
import { useRegisterMutation } from './hooks'
import { registerSchema, type RegisterFormValues } from './schemas'

export function RegisterForm() {
  const navigate = useNavigate()
  const registerMutation = useRegisterMutation()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', fullName: '', phone: '' },
  })

  function onSubmit(values: RegisterFormValues) {
    registerMutation.mutate(values, {
      onSuccess: () => {
        toast.success('Cuenta creada')
        navigate('/', { replace: true })
      },
      onError: (error) => {
        const handledByForm = applyValidationErrors(error, form.setError)
        if (!handledByForm) toast.error(getApiErrorMessage(error))
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre completo</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefono (opcional)</FormLabel>
              <FormControl>
                <Input type="tel" autoComplete="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contrasena</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>
    </Form>
  )
}
