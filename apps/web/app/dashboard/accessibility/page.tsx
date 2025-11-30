'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Loader2, Eye, Keyboard, Mouse, Monitor, Contrast, Type } from 'lucide-react'

interface AccessibilitySetting {
    id: string
    title: string
    description: string
    value: boolean | string | number
    type: 'toggle' | 'select' | 'slider'
    options?: string[]
}

export default function AccessibilityPage() {
    const [saving, setSaving] = useState(false)

    // Accessibility settings state - will be fetched from API
    const [settings, setSettings] = useState<AccessibilitySetting[]>([])
    const [settingsLoading, setSettingsLoading] = useState(true)

    // Fetch accessibility settings on component mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/accessibility')
                if (response.ok) {
                    const data = await response.json()
                    setSettings(data.settings || [])
                }
            } catch {
                console.error('Failed to fetch accessibility settings')
            } finally {
                setSettingsLoading(false)
            }
        }

        fetchSettings()
    }, [])

    // Show loading state while data is being fetched
    if (settingsLoading) {
        return (
            <div className="space-y-4 px-2 sm:px-0">
                <Card className='border-none'>
                    <CardContent className="w-full border-b px-2 sm:px-0 py-6">
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const handleSettingChange = async (settingId: string, value: string | boolean | number) => {
        setSettings(prev =>
            prev.map(setting =>
                setting.id === settingId
                    ? { ...setting, value }
                    : setting
            )
        )
    }

    const handleSaveSettings = async () => {
        setSaving(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            alert('Accessibility settings saved successfully')
        } catch {
            alert('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    const handleResetSettings = async () => {
        try {
            // Reset to defaults
            setSettings(prev =>
                prev.map(setting => {
                    const defaults: Record<string, string | boolean | number> = {
                        'high-contrast': false,
                        'large-text': false,
                        'reduce-motion': false,
                        'keyboard-navigation': true,
                        'screen-reader': true,
                        'focus-indicators': true,
                        'text-size': 16,
                        'line-height': 1.5,
                        'color-blindness': 'none'
                    }
                    const defaultValue = defaults[setting.id] as string | boolean | number | undefined
                    return { ...setting, value: defaultValue ?? setting.value }
                })
            )
            
            alert('Settings reset to defaults')
        } catch {
            alert('Failed to reset settings')
        }
    }

    const getSettingIcon = (settingId: string) => {
        switch (settingId) {
            case 'high-contrast': return <Contrast className="h-5 w-5" />
            case 'large-text': return <Type className="h-5 w-5" />
            case 'reduce-motion': return <Monitor className="h-5 w-5" />
            case 'keyboard-navigation': return <Keyboard className="h-5 w-5" />
            case 'screen-reader': return <Eye className="h-5 w-5" />
            case 'focus-indicators': return <Mouse className="h-5 w-5" />
            default: return <Monitor className="h-5 w-5" />
        }
    }

    return (
        <div className="space-y-4 px-2 sm:px-0">
            <Card className='border-none'>
                <CardContent className="w-full border-b px-2 sm:px-0 py-6">
                    <div className="space-y-6">
                        {/* Page Header */}
                        <div className="flex items-center justify-between border-b pb-4">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold">Accessibility</h1>
                                <p className="text-muted-foreground">Customize accessibility options for your needs</p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleResetSettings} variant="outline" size="sm">
                                    Reset to Defaults
                                </Button>
                                <Button onClick={handleSaveSettings} disabled={saving} className="border-b-2">
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Visual Settings */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Eye className="h-5 w-5" />
                                    Visual Settings
                                </h3>
                                <p className="text-sm text-muted-foreground">Adjust visual elements for better visibility</p>
                            </div>
                            <div className="rounded-md border">
                                {settings.filter(s => ['high-contrast', 'large-text', 'text-size', 'line-height', 'color-blindness'].includes(s.id)).map((setting, index) => (
                                    <div key={setting.id} className={`flex items-center justify-between p-4 ${index !== 5 - 1 ? 'border-b' : ''}`}>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {getSettingIcon(setting.id)}
                                                <p className="font-medium">{setting.title}</p>
                                                {setting.type === 'toggle' && setting.value && (
                                                    <Badge variant="default" className="text-xs">Enabled</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{setting.description}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {setting.type === 'toggle' && (
                                                <Switch
                                                    checked={setting.value as boolean}
                                                    onCheckedChange={(checked) => handleSettingChange(setting.id, checked)}
                                                />
                                            )}
                                            {setting.type === 'select' && setting.options && (
                                                <Select
                                                    value={setting.value as string}
                                                    onValueChange={(value) => handleSettingChange(setting.id, value)}
                                                >
                                                    <SelectTrigger className="w-40">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {setting.options.map((option) => (
                                                            <SelectItem key={option} value={option}>
                                                                {option.charAt(0).toUpperCase() + option.slice(1)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                            {setting.type === 'slider' && (
                                                <div className="flex items-center gap-3">
                                                    <Slider
                                                        value={[setting.value as number]}
                                                        onValueChange={([value]) => handleSettingChange(setting.id, value)}
                                                        min={setting.id === 'text-size' ? 12 : 1}
                                                        max={setting.id === 'text-size' ? 24 : 2}
                                                        step={setting.id === 'text-size' ? 1 : 0.1}
                                                        className="w-24"
                                                    />
                                                    <span className="text-sm text-muted-foreground w-12">
                                                        {setting.id === 'text-size' ? `${setting.value as number}px` : `${setting.value as number}`}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Interaction Settings */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Keyboard className="h-5 w-5" />
                                    Interaction Settings
                                </h3>
                                <p className="text-sm text-muted-foreground">Configure how you interact with the interface</p>
                            </div>
                            <div className="rounded-md border">
                                {settings.filter(s => ['reduce-motion', 'keyboard-navigation', 'screen-reader', 'focus-indicators'].includes(s.id)).map((setting, index) => (
                                    <div key={setting.id} className={`flex items-center justify-between p-4 ${index !== 4 - 1 ? 'border-b' : ''}`}>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {getSettingIcon(setting.id)}
                                                <p className="font-medium">{setting.title}</p>
                                                {setting.value && (
                                                    <Badge variant="default" className="text-xs">Enabled</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{setting.description}</p>
                                        </div>
                                        <Switch
                                            checked={setting.value as boolean}
                                            onCheckedChange={(checked) => handleSettingChange(setting.id, checked)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Preview Section */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Eye className="h-5 w-5" />
                                    Preview
                                </h3>
                                <p className="text-sm text-muted-foreground">See how your accessibility changes affect the interface</p>
                            </div>
                            <div className="rounded-md border">
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                            <Type className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Sample Content</h4>
                                            <p className="text-sm text-muted-foreground">This is how text will appear with your settings</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="h-2 bg-muted rounded w-3/4"></div>
                                        <div className="h-2 bg-muted rounded w-1/2"></div>
                                        <div className="h-2 bg-muted rounded w-2/3"></div>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline">Primary Action</Button>
                                        <Button size="sm">Secondary Action</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
