import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Store, Mail, Lock, AlertCircle, XCircle } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

// Map Supabase error codes to user-friendly messages
const getErrorMessage = (error: { message: string; code?: string }) => {
    const message = error.message.toLowerCase()
    
    if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
        return {
            title: 'Login Gagal',
            description: 'Email atau password yang Anda masukkan salah. Silakan periksa kembali dan coba lagi.',
            suggestion: 'Pastikan Caps Lock tidak aktif dan periksa ejaan email Anda.'
        }
    }
    if (message.includes('email not confirmed')) {
        return {
            title: 'Email Belum Dikonfirmasi',
            description: 'Akun Anda belum diaktivasi. Silakan cek inbox email Anda untuk link konfirmasi.',
            suggestion: 'Periksa folder spam jika tidak menemukan email konfirmasi.'
        }
    }
    if (message.includes('too many requests') || message.includes('rate limit')) {
        return {
            title: 'Terlalu Banyak Percobaan',
            description: 'Anda telah mencoba login terlalu banyak. Silakan tunggu beberapa menit.',
            suggestion: 'Tunggu 5-10 menit sebelum mencoba lagi.'
        }
    }
    if (message.includes('user not found')) {
        return {
            title: 'Akun Tidak Ditemukan',
            description: 'Email yang Anda masukkan tidak terdaftar di sistem kami.',
            suggestion: 'Periksa email Anda atau daftar akun baru.'
        }
    }
    if (message.includes('network') || message.includes('fetch')) {
        return {
            title: 'Koneksi Bermasalah',
            description: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
            suggestion: 'Pastikan Anda terhubung ke internet dan coba lagi.'
        }
    }
    
    return {
        title: 'Login Gagal',
        description: error.message,
        suggestion: 'Silakan coba lagi atau hubungi administrator.'
    }
}

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [errorDialog, setErrorDialog] = useState<{
        open: boolean
        title: string
        description: string
        suggestion: string
    }>({ open: false, title: '', description: '', suggestion: '' })
    const { signIn, user } = useAuth()
    const navigate = useNavigate()

    // Navigate to dashboard when user is confirmed
    useEffect(() => {
        if (user) {
            console.log('User detected, navigating to dashboard')
            navigate('/dashboard', { replace: true })
        }
    }, [user, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorDialog({ open: false, title: '', description: '', suggestion: '' })
        setLoading(true)

        try {
            const { error } = await signIn(email, password)
            if (error) {
                const errorInfo = getErrorMessage(error)
                setErrorDialog({
                    open: true,
                    ...errorInfo
                })
                setLoading(false)
            }
            // Don't navigate here - let useEffect handle it when user state updates
        } catch (err) {
            setErrorDialog({
                open: true,
                title: 'Kesalahan Sistem',
                description: 'Terjadi kesalahan yang tidak terduga.',
                suggestion: 'Silakan muat ulang halaman dan coba lagi.'
            })
            setLoading(false)
        }
    }

    return (
        <>
            {/* Error Dialog */}
            <Dialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, open }))}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                <XCircle className="h-6 w-6 text-destructive" />
                            </div>
                            <div>
                                <DialogTitle className="text-destructive">{errorDialog.title}</DialogTitle>
                            </div>
                        </div>
                        <DialogDescription className="pt-4 text-left">
                            <p className="text-foreground mb-2">{errorDialog.description}</p>
                            <p className="text-muted-foreground text-sm">💡 {errorDialog.suggestion}</p>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end pt-2">
                        <Button onClick={() => setErrorDialog(prev => ({ ...prev, open: false }))}>
                            Coba Lagi
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(217.2,32.6%,17.5%)] to-[hsl(222.2,84%,4.9%)] p-4">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-lg mb-4">
                            <Store className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">URASI POS</h1>
                        <p className="text-white/60 mt-1">Point of Sale System</p>
                    </div>

                    {/* Login Card */}
                    <Card className="border-0 shadow-2xl">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Welcome Back</CardTitle>
                            <CardDescription>Sign in to your account to continue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        icon={<Mail className="h-4 w-4" />}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        icon={<Lock className="h-4 w-4" />}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" size="lg" loading={loading}>
                                    Sign In
                                </Button>
                            </form>

                            <div className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-[hsl(var(--primary))] hover:underline font-medium">
                                    Sign up
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <p className="mt-6 text-center text-white/40 text-sm">
                        © 2024 URASI POS. All rights reserved.
                    </p>
                </div>
            </div>
        </>
    )
}
