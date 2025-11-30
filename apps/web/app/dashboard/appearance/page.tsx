'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Palette, Monitor, Sun, Moon } from 'lucide-react'

interface Theme {
    id: string
    name: string
    description: string
    preview: string
    icon: React.ReactNode
    colors: {
        primary: string
        secondary: string
        background: string
        foreground: string
    }
}

export default function AppearancePage() {
    const [saving, setSaving] = useState(false)
    const { theme: currentTheme, setTheme } = useTheme()
    const [selectedTheme, setSelectedTheme] = useState(currentTheme || 'system')
    const { toast } = useToast()

    const themes: Theme[] = [
        {
            id: 'system',
            name: 'System',
            description: '',
            preview: 'bg-muted',
            icon: <Monitor className="h-6 w-6 text-muted-foreground" />,
            colors: {
                primary: 'hsl(var(--primary))',
                secondary: 'hsl(var(--secondary))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))'
            }
        },
        {
            id: 'light',
            name: 'Light',
            description: '',
            preview: 'bg-muted',
            icon: <Sun className="h-6 w-6 text-muted-foreground" />,
            colors: {
                primary: 'hsl(var(--primary))',
                secondary: 'hsl(var(--secondary))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))'
            }
        },
        {
            id: 'dark',
            name: 'Dark',
            description: '',
            preview: 'bg-muted',
            icon: <Moon className="h-6 w-6 text-muted-foreground" />,
            colors: {
                primary: 'hsl(var(--primary))',
                secondary: 'hsl(var(--secondary))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))'
            }
        }
    ]

    const colorOptions = [
        { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
        { name: 'Green', value: 'green', class: 'bg-green-500' },
        { name: 'Red', value: 'red', class: 'bg-red-500' },
        { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
        { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
        { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
        { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500' },
        { name: 'Cyan', value: 'cyan', class: 'bg-cyan-500' }
    ]

    const [selectedColor, setSelectedColor] = useState('blue')

    // Load saved preferences from cookies on mount
    useEffect(() => {
        const loadSavedPreferences = () => {
            // Load saved color
            const colorCookie = document.cookie
                .split('; ')
                .find(row => row.startsWith('primaryColor='))
            
            if (colorCookie) {
                const savedColor = colorCookie.split('=')[1]
                setSelectedColor(savedColor)
                
                // Apply the saved color directly without calling handleColorChange
                const root = document.documentElement
                const colorMap: Record<string, { hsl: string; rgb: string }> = {
                    blue: { hsl: '221.2 83.2% 53.3%', rgb: '59 130 246' },
                    green: { hsl: '142.1 76.2% 36.3%', rgb: '34 197 94' },
                    red: { hsl: '346.8 77.2% 49.8%', rgb: '239 68 68' },
                    purple: { hsl: '262.1 83.3% 57.8%', rgb: '147 51 234' },
                    orange: { hsl: '24.6 95% 53.1%', rgb: '249 115 22' },
                    pink: { hsl: '330.4 81.2% 60.4%', rgb: '236 72 153' },
                    yellow: { hsl: '41.1 96.3% 50.2%', rgb: '245 158 11' },
                    cyan: { hsl: '188.7 94.2% 35.5%', rgb: '6 182 212' }
                }
                
                // Update all primary color variations
                const colorData = colorMap[savedColor]
                if (colorData) {
                    root.style.setProperty('--primary', colorData.hsl)
                    root.style.setProperty('--primary-foreground', '0 0% 100%')
                    root.style.setProperty('--primary-rgb', colorData.rgb)
                }
            }
        }

        loadSavedPreferences()
    }, [])

    const handleThemeChange = async (themeId: string) => {
        setSelectedTheme(themeId)
        setTheme(themeId)
        // Save to cookies
        document.cookie = `theme=${themeId}; path=/; max-age=31536000` // 1 year
    }

    const handleColorChange = (color: string) => {
        setSelectedColor(color)
        // Apply color theme by updating CSS variables
        const root = document.documentElement
        const colorMap: Record<string, { hsl: string; rgb: string }> = {
            blue: { hsl: '221.2 83.2% 53.3%', rgb: '59 130 246' },
            green: { hsl: '142.1 76.2% 36.3%', rgb: '34 197 94' },
            red: { hsl: '346.8 77.2% 49.8%', rgb: '239 68 68' },
            purple: { hsl: '262.1 83.3% 57.8%', rgb: '147 51 234' },
            orange: { hsl: '24.6 95% 53.1%', rgb: '249 115 22' },
            pink: { hsl: '330.4 81.2% 60.4%', rgb: '236 72 153' },
            yellow: { hsl: '41.1 96.3% 50.2%', rgb: '245 158 11' },
            cyan: { hsl: '188.7 94.2% 35.5%', rgb: '6 182 212' }
        }
        
        // Update all primary color variations
        root.style.setProperty('--primary', colorMap[color].hsl)
        root.style.setProperty('--primary-foreground', '0 0% 100%')
        root.style.setProperty('--primary-rgb', colorMap[color].rgb)
        
        // Save to cookies
        document.cookie = `primaryColor=${color}; path=/; max-age=31536000` // 1 year
    }

    const handleSaveSettings = async () => {
        setSaving(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            toast({
                title: "Success",
                description: "Appearance settings saved successfully",
            })
        } catch {
            toast({
                title: "Error",
                description: "Failed to save settings",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    const handleResetSettings = async () => {
        try {
            setSelectedTheme('system')
            setTheme('system')
            toast({
                title: "Reset",
                description: "Settings reset to defaults",
            })
        } catch {
            toast({
                title: "Error",
                description: "Failed to reset settings",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="space-y-4 px-2 sm:px-0">
            <Card className='border-none'>
                <CardContent className="w-full border-b px-2 sm:px-0 py-6">
                    <div className="space-y-6">
                        {/* Page Header */}
                        <div className="space-y-1 border-b pb-4">
                            <h1 className="text-2xl font-bold">Appearance</h1>
                            <p className="text-muted-foreground">Customize your theme and colors</p>
                        </div>

                        {/* Theme Selection */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Palette className="h-5 w-5" />
                                    Theme
                                </h3>
                                <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
                            </div>
                            <div className="p-8">
                                <div className="flex justify-center gap-8">
                                    {themes.map((theme) => (
                                        <div
                                            key={theme.id}
                                            className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 text-center ${
                                                selectedTheme === theme.id
                                                    ? 'border-primary ring-2 ring-primary/20 ring-offset-2'
                                                    : 'border-border hover:border-primary/30'
                                            }`}
                                            onClick={() => handleThemeChange(theme.id)}
                                        >
                                            <div className="flex flex-col items-center gap-3">
                                                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${theme.preview}`}>
                                                    {theme.icon}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{theme.name}</h4>
                                                </div>
                                                {selectedTheme === theme.id && (
                                                    <Badge variant="default" className="text-xs">Active</Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Color Selection */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Palette className="h-5 w-5" />
                                    Primary Color
                                </h3>
                                <p className="text-sm text-muted-foreground">Choose your preferred primary color</p>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-center gap-3 flex-wrap">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color.value}
                                            onClick={() => handleColorChange(color.value)}
                                            className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                                                selectedColor === color.value
                                                    ? 'border-gray-900 dark:border-gray-100 ring-2 ring-offset-2 ring-gray-400'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            } ${color.class}`}
                                            title={color.name}
                                        >
                                            {selectedColor === color.value && (
                                                <div className="w-full h-full rounded-full flex items-center justify-center bg-white/30">
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Save Button at Bottom */}
                        <div className="flex justify-center gap-2 pt-4 border-t">
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
                </CardContent>
            </Card>
        </div>
    )
}
