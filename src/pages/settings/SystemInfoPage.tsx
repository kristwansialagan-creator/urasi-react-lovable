import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Info, Server, Database, Code, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function SystemInfoPage() {
    const [dbInfo, setDbInfo] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const appInfo = {
        name: 'NexoPOS React',
        version: '1.0.0',
        buildDate: '2026-01-15',
        environment: import.meta.env.MODE,
        nodeVersion: 'Browser',
        reactVersion: '18.3.1',
        viteVersion: '7.3.1'
    }

    const checkDatabase = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true })

            if (!error) {
                setDbInfo({
                    status: 'Connected',
                    health: 'Healthy',
                    productsCount: data?.length || 0
                })
            } else {
                setDbInfo({ status: 'Error', health: 'Unhealthy', error: error.message })
            }
        } catch (err) {
            setDbInfo({ status: 'Disconnected', health: 'Failed', error: 'Connection failed' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        checkDatabase()
    }, [])

    const requirements = [
        { name: 'React 18+', required: '18.0.0', current: '18.3.1', status: true },
        { name: 'Vite 7+', required: '7.0.0', current: '7.3.1', status: true },
        { name: 'Supabase Client', required: '2.0.0', current: '2.39.0', status: true },
        { name: 'TailwindCSS 4+', required: '4.0.0', current: '4.0.0', status: true },
        { name: 'Browser Storage', required: 'localStorage', current: 'Available', status: typeof window !== 'undefined' && !!window.localStorage }
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Info className="h-8 w-8" />System Information</h1>
                <Button onClick={checkDatabase} disabled={loading}><RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh</Button>
            </div>

            {/* Application Info */}
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Code className="h-5 w-5" />Application Information</CardTitle></CardHeader><CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(appInfo).map(([key, value]) => (
                        <div key={key} className="flex justify-between p-3 bg-[hsl(var(--muted))] rounded">
                            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span className="font-mono">{value}</span>
                        </div>
                    ))}
                </div>
            </CardContent></Card>

            {/* Database Info */}
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" />Database Information</CardTitle></CardHeader><CardContent>
                {dbInfo ? (
                    <div className="space-y-3">
                        <div className="flex justify-between p-3 bg-[hsl(var(--muted))] rounded">
                            <span className="font-medium">Status:</span>
                            <span className={`flex items-center gap-2 ${dbInfo.status === 'Connected' ? 'text-green-600' : 'text-red-600'}`}>
                                {dbInfo.status === 'Connected' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                {dbInfo.status}
                            </span>
                        </div>
                        <div className="flex justify-between p-3 bg-[hsl(var(--muted))] rounded">
                            <span className="font-medium">Health:</span>
                            <span className={dbInfo.health === 'Healthy' ? 'text-green-600' : 'text-red-600'}>{dbInfo.health}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-[hsl(var(--muted))] rounded">
                            <span className="font-medium">Provider:</span>
                            <span>Supabase (PostgreSQL)</span>
                        </div>
                        {dbInfo.error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                                <strong>Error:</strong> {dbInfo.error}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-4 text-[hsl(var(--muted-foreground))]">Checking database...</div>
                )}
            </CardContent></Card>

            {/* System Requirements */}
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" />System Requirements</CardTitle></CardHeader><CardContent>
                <div className="space-y-2">
                    {requirements.map(req => (
                        <div key={req.name} className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                            <div className="flex items-center gap-3">
                                {req.status ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                                <span className="font-medium">{req.name}</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm">Current: <span className="font-mono">{req.current}</span></div>
                                <div className="text-xs text-[hsl(var(--muted-foreground))]">Required: {req.required}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent></Card>

            {/* Environment Variables */}
            <Card><CardHeader><CardTitle>Environment Configuration</CardTitle></CardHeader><CardContent>
                <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-[hsl(var(--muted))] rounded">
                        <span className="font-medium">Mode:</span>
                        <span className={`px-2 py-1 rounded text-xs ${import.meta.env.MODE === 'production' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{import.meta.env.MODE}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-[hsl(var(--muted))] rounded">
                        <span className="font-medium">Supabase URL:</span>
                        <span className="font-mono text-sm">{import.meta.env.VITE_SUPABASE_URL ? 'Configured ✓' : 'Not Set ✗'}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-[hsl(var(--muted))] rounded">
                        <span className="font-medium">Supabase Key:</span>
                        <span className="font-mono text-sm">{import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured ✓' : 'Not Set ✗'}</span>
                    </div>
                </div>
            </CardContent></Card>

            {/* Browser Info */}
            <Card><CardHeader><CardTitle>Browser Information</CardTitle></CardHeader><CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex justify-between p-3 bg-[hsl(var(--muted))] rounded">
                        <span className="font-medium">User Agent:</span>
                        <span className="text-sm truncate max-w-[200px]">{navigator.userAgent.split(' ').slice(0, 3).join(' ')}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-[hsl(var(--muted))] rounded">
                        <span className="font-medium">Online Status:</span>
                        <span className={navigator.onLine ? 'text-green-600' : 'text-red-600'}>{navigator.onLine ? 'Online' : 'Offline'}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-[hsl(var(--muted))] rounded">
                        <span className="font-medium">Language:</span>
                        <span>{navigator.language}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-[hsl(var(--muted))] rounded">
                        <span className="font-medium">Platform:</span>
                        <span>{navigator.platform || 'Unknown'}</span>
                    </div>
                </div>
            </CardContent></Card>
        </div>
    )
}
