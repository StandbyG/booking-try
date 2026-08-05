import { Link } from 'react-router-dom'
import { RegisterForm } from './RegisterForm'

export function RegisterPage() {
  return (
    <div className="space-y-4">
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground">
        Ya tenes cuenta?{' '}
        <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
          Ingresa
        </Link>
      </p>
    </div>
  )
}
