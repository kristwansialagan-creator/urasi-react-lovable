import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Save, Camera, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useMedia } from '@/hooks'

export default function ProfilePage() {
    const { uploadFile } = useMedia()
    const [user, setUser] = useState<any>(null)
    const [formData, setFormData] = useState({ username: '', email: '', phone: '', avatar_url: '' })
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' })
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchUser()
    }, [])

    const fetchUser = async () => {
        const { data } = await supabase.auth.getUser()
        if (data.user) {
            setUser(data.user)
            setFormData({
                username: data.user.user_metadata?.username || '',
                email: data.user.email || '',
                phone: data.user.user_metadata?.phone || '',
                avatar_url: data.user.user_metadata?.avatar_url || ''
            })
        }
    }

    const handleSaveProfile = async () => {
        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    username: formData.username,
                    phone: formData.phone,
                    avatar_url: formData.avatar_url
                }
            })
            if (error) throw error
            alert('Profile updated successfully!')
            fetchUser()
        } catch (err: any) {
            alert(err.message || 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const { url } = await uploadFile(file)
        if (url) {
            setFormData({ ...formData, avatar_url: url })
        }
        setUploading(false)
    }

    const handleChangePassword = async () => {
        if (passwordData.new !== passwordData.confirm) {
            return alert('New passwords do not match')
        }
        if (passwordData.new.length < 6) {
            return alert('Password must be at least 6 characters')
        }

        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.new
            })
            if (error) throw error
            alert('Password changed successfully!')
            setPasswordData({ current: '', new: '', confirm: '' })
            setShowPasswordModal(false)
        } catch (err: any) {
            alert(err.message || 'Failed to change password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><User className="h-8 w-8" />My Profile</h1>
            </div>

            {/* Profile Information */}
            <Card><CardHeader><CardTitle>Profile Information</CardTitle></CardHeader><CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                    <div className="relative">
                        {formData.avatar_url ? (
                            <img src={formData.avatar_url} alt="Avatar" className="h-24 w-24 rounded-full border-4 border-[hsl(var(--border))] object-cover" />
                        ) : (
                            <div className="h-24 w-24 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center border-4 border-[hsl(var(--border))]">
                                <User className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
                            </div>
                        )}
                        <label className="absolute bottom-0 right-0 cursor-pointer bg-[hsl(var(--primary))] text-white rounded-full p-2 hover:opacity-80">
                            <Camera className="h-4 w-4" />
                            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
                        </label>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{formData.username || 'User'}</h3>
                        <p className="text-[hsl(var(--muted-foreground))]">{formData.email}</p>
                        {uploading && <p className="text-sm text-[hsl(var(--primary))]">Uploading...</p>}
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Username</Label><Input value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} placeholder="Your username" /></div>
                    <div><Label>Email (Read-only)</Label><Input value={formData.email} disabled className="bg-[hsl(var(--muted))]" /></div>
                </div>

                <div><Label>Phone Number</Label><Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 234 567 8900" /></div>

                <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveProfile} disabled={loading}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
                </div>
            </CardContent></Card>

            {/* Security */}
            <Card><CardHeader><CardTitle>Security</CardTitle></CardHeader><CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                        <div>
                            <Label className="font-medium">Password</Label>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Last changed: Recently</p>
                        </div>
                        <Button variant="outline" onClick={() => setShowPasswordModal(true)}><Lock className="h-4 w-4 mr-2" />Change Password</Button>
                    </div>
                </div>
            </CardContent></Card>

            {/* Activity */}
            <Card><CardHeader><CardTitle>Account Information</CardTitle></CardHeader><CardContent>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-[hsl(var(--muted-foreground))]">User ID:</span>
                        <span className="font-mono">{user?.id?.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-[hsl(var(--muted-foreground))]">Account Created:</span>
                        <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-[hsl(var(--muted-foreground))]">Last Sign In:</span>
                        <span>{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '-'}</span>
                    </div>
                </div>
            </CardContent></Card>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md"><CardHeader><CardTitle>Change Password</CardTitle></CardHeader><CardContent className="space-y-4">
                        <div><Label>New Password *</Label><Input type="password" value={passwordData.new} onChange={e => setPasswordData({ ...passwordData, new: e.target.value })} placeholder="Minimum 6 characters" /></div>
                        <div><Label>Confirm New Password *</Label><Input type="password" value={passwordData.confirm} onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })} placeholder="Re-enter new password" /></div>
                        <div className="flex gap-2 pt-4">
                            <Button variant="outline" onClick={() => { setShowPasswordModal(false); setPasswordData({ current: '', new: '', confirm: '' }) }} className="flex-1">Cancel</Button>
                            <Button onClick={handleChangePassword} disabled={loading} className="flex-1">Change Password</Button>
                        </div>
                    </CardContent></Card>
                </div>
            )}
        </div>
    )
}
