import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function UnauthorizedPage() {
    const navigate = useNavigate()

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                        <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle className="text-2xl">Access Denied</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-[hsl(var(--muted-foreground))]">
                        You don't have permission to access this page. Please contact your administrator if you believe this is an error.
                    </p>
                    <div className="flex gap-2 justify-center">
                        <Button variant="outline" onClick={() => navigate(-1)}>
                            Go Back
                        </Button>
                        <Button onClick={() => navigate('/dashboard')}>
                            Go to Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
