import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Send, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
    const [step, setStep] = useState<'email' | 'code' | 'success'>('email')
    const [email, setEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleSendEmail = async () => {
        if (!email) {
            return setMessage('Please enter your email address')
        }

        setLoading(true)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            })

            if (error) throw error

            setMessage('Password reset email sent! Please check your inbox.')
            setStep('code')
        } catch (err: any) {
            setMessage(err.message || 'Failed to send reset email')
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            return setMessage('Passwords do not match')
        }

        if (newPassword.length < 6) {
            return setMessage('Password must be at least 6 characters')
        }

        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) throw error

            setMessage('Password reset successfully!')
            setStep('success')
        } catch (err: any) {
            setMessage(err.message || 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, label: '', color: '' }
        if (password.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' }
        if (password.length < 10) return { strength: 2, label: 'Medium', color: 'bg-yellow-500' }
        return { strength: 3, label: 'Strong', color: 'bg-green-500' }
    }

    const passwordStrength = getPasswordStrength(newPassword)

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-[hsl(var(--primary))] text-white rounded-full h-16 w-16 flex items-center justify-center mb-4">
                        <Lock className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl">Reset Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {step === 'email' && (
                        <>
                            <p className="text-center text-[hsl(var(--muted-foreground))]">
                                Enter your email address and we'll send you a password reset link.
                            </p>
                            <div>
                                <Label>Email Address *</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    onKeyPress={e => e.key === 'Enter' && handleSendEmail()}
                                />
                            </div>
                            {message && (
                                <div className={`p-3 rounded text-sm ${message.includes('success') || message.includes('sent') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {message}
                                </div>
                            )}
                            <Button onClick={handleSendEmail} disabled={loading} className="w-full">
                                <Send className="h-4 w-4 mr-2" />
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </>
                    )}

                    {step === 'code' && (
                        <>
                            <p className="text-center text-[hsl(var(--muted-foreground))]">
                                Check your email for the reset link, then enter your new password below.
                            </p>
                            <div>
                                <Label>New Password *</Label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                />
                                {newPassword && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className={`h-1 flex-1 rounded ${i <= passwordStrength.strength ? passwordStrength.color : 'bg-gray-200'}`} />
                                            ))}
                                        </div>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Strength: {passwordStrength.label}</p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label>Confirm New Password *</Label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter new password"
                                    onKeyPress={e => e.key === 'Enter' && handleResetPassword()}
                                />
                            </div>
                            {message && (
                                <div className={`p-3 rounded text-sm ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {message}
                                </div>
                            )}
                            <Button onClick={handleResetPassword} disabled={loading} className="w-full">
                                <Lock className="h-4 w-4 mr-2" />
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                            <Button variant="outline" onClick={() => { setStep('email'); setMessage('') }} className="w-full">
                                Back to Email
                            </Button>
                        </>
                    )}

                    {step === 'success' && (
                        <>
                            <div className="text-center">
                                <div className="mx-auto bg-green-100 text-green-600 rounded-full h-16 w-16 flex items-center justify-center mb-4">
                                    <CheckCircle className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Password Reset Successfully!</h3>
                                <p className="text-[hsl(var(--muted-foreground))] mb-6">
                                    Your password has been changed. You can now sign in with your new password.
                                </p>
                            </div>
                            <Button onClick={() => window.location.href = '/login'} className="w-full">
                                Go to Login
                            </Button>
                        </>
                    )}

                    <div className="text-center">
                        <a href="/login" className="text-sm text-[hsl(var(--primary))] hover:underline">
                            Back to Login
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
