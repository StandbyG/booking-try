import { Outlet } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthLayout() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-xl">Booking Engine</CardTitle>
        </CardHeader>
        <CardContent>
          <Outlet />
        </CardContent>
      </Card>
    </div>
  )
}
