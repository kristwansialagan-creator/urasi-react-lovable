import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useModules } from '@/hooks'
import { Settings, Package } from 'lucide-react'

export default function ModulesPage() {
    const { modules, toggleModule } = useModules()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Modules</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Manage system plugins and extensions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {modules.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-[hsl(var(--muted-foreground))]">
                            No modules installed. System core is active.
                        </CardContent>
                    </Card>
                ) : (
                    modules.map((module) => (
                        <Card key={module.id} className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${module.status === 'enabled' ? 'bg-primary/10' : 'bg-muted'}`}>
                                    <Package className={`h-6 w-6 ${module.status === 'enabled' ? 'text-primary' : 'text-muted-foreground'}`} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{module.label}</h3>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{module.description}</p>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-mono">{module.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" disabled={module.status === 'disabled'}>
                                    <Settings className="mr-2 h-4 w-4" /> Attributes
                                </Button>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{module.status === 'enabled' ? 'Enabled' : 'Disabled'}</span>
                                    <Switch
                                        checked={module.status === 'enabled'}
                                        onCheckedChange={() => toggleModule(module.id, module.status || 'disabled')}
                                    />
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <div className="alert bg-blue-50 text-blue-700 p-4 rounded-md border border-blue-200">
                <h4 className="font-bold flex items-center gap-2"><Settings className="h-4 w-4" /> Developer Note</h4>
                <p className="text-sm mt-1">
                    Modules are system extensions. To add new modules, you typically need to install them via the package manager or upload them to the server plugins directory.
                    This page controls their activation status.
                </p>
            </div>
        </div>
    )
}
