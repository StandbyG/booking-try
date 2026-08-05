import { Link } from 'react-router-dom'
import { LoginForm } from './LoginForm'

export function LoginPage() {
  return (
    <div className="space-y-4">
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        No tenes cuenta?{' '}
        <Link to="/register" className="font-medium text-foreground underline underline-offset-4">
          Registrate
        </Link>
      </p>
    </div>
  )
}
