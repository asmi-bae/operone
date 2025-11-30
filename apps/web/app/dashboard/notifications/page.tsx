'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Bell, Mail, Smartphone, MessageSquare, Settings, Check, X, Plus, Trash2 } from 'lucide-react'

interface Notification {
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    timestamp: string
    read: boolean
    action?: string
}

interface NotificationPreference {
    id: string
    category: string
    title: string
    description: string
    email: boolean
    push: boolean
    inApp: boolean
}

interface NotificationRule {
    id: string
    name: string
    conditions: string[]
    actions: string[]
    enabled: boolean
}

export default function NotificationsPage() {
    const [loading, setLoading] = useState(false)
    const [showRuleDialog, setShowRuleDialog] = useState(false)
    const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

    // Notifications state - will be fetched from API
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [notificationsLoading, setNotificationsLoading] = useState(true)

    // Notification preferences state - will be fetched from API
    const [preferences, setPreferences] = useState<NotificationPreference[]>([])
    const [preferencesLoading, setPreferencesLoading] = useState(true)

    // Notification rules state - will be fetched from API
    const [rules, setRules] = useState<NotificationRule[]>([])
    const [rulesLoading, setRulesLoading] = useState(true)

    // Fetch notifications data on component mount
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch('/api/notifications')
                if (response.ok) {
                    const data = await response.json()
                    setNotifications(data.notifications || [])
                }
            } catch {
                console.error('Failed to fetch notifications')
            } finally {
                setNotificationsLoading(false)
            }
        }

        const fetchPreferences = async () => {
            try {
                const response = await fetch('/api/notifications/preferences')
                if (response.ok) {
                    const data = await response.json()
                    setPreferences(data.preferences || [])
                }
            } catch {
                console.error('Failed to fetch notification preferences')
            } finally {
                setPreferencesLoading(false)
            }
        }

        const fetchRules = async () => {
            try {
                const response = await fetch('/api/notifications/rules')
                if (response.ok) {
                    const data = await response.json()
                    setRules(data.rules || [])
                }
            } catch {
                console.error('Failed to fetch notification rules')
            } finally {
                setRulesLoading(false)
            }
        }

        fetchNotifications()
        fetchPreferences()
        fetchRules()
    }, [])

    // Show loading state while data is being fetched
    if (notificationsLoading || preferencesLoading || rulesLoading) {
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

    const handleMarkAsRead = (notificationId: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === notificationId
                    ? { ...notification, read: true }
                    : notification
            )
        )
    }

    const handleMarkAllAsRead = async () => {
        setLoading(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            setNotifications(prev =>
                prev.map(notification => ({ ...notification, read: true }))
            )
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteNotification = (notificationId: string) => {
        setNotifications(prev =>
            prev.filter(notification => notification.id !== notificationId)
        )
    }

    const handleDeleteSelected = async () => {
        setLoading(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            setNotifications(prev =>
                prev.filter(notification => !selectedNotifications.includes(notification.id))
            )
            setSelectedNotifications([])
        } finally {
            setLoading(false)
        }
    }

    const handlePreferenceToggle = (preferenceId: string, channel: 'email' | 'push' | 'inApp') => {
        setPreferences(prev =>
            prev.map(preference =>
                preference.id === preferenceId
                    ? { ...preference, [channel]: !preference[channel] }
                    : preference
            )
        )
    }

    const handleCreateRule = async () => {
        setShowRuleDialog(false)
        alert('Notification rule created successfully')
    }

    const handleToggleRule = (ruleId: string, enabled: boolean) => {
        setRules(prev =>
            prev.map(rule =>
                rule.id === ruleId
                    ? { ...rule, enabled }
                    : rule
            )
        )
    }

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success': return <Check className="h-4 w-4 text-green-500" />
            case 'warning': return <Bell className="h-4 w-4 text-yellow-500" />
            case 'error': return <X className="h-4 w-4 text-red-500" />
            default: return <Bell className="h-4 w-4 text-blue-500" />
        }
    }

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.read
        if (filter === 'read') return notification.read
        return true
    })

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="space-y-4 px-2 sm:px-0">
            <Card className='border-none'>
                <CardContent className="w-full border-b px-2 sm:px-0 py-6">
                    <div className="space-y-6">
                        {/* Page Header */}
                        <div className="flex items-center justify-between border-b pb-4">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold">Notifications</h1>
                                <p className="text-muted-foreground">Manage your notifications and preferences</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                    {unreadCount} unread
                                </Badge>
                                <Button
                                    onClick={handleMarkAllAsRead}
                                    variant="outline"
                                    size="sm"
                                    disabled={unreadCount === 0 || loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Marking...
                                        </>
                                    ) : (
                                        'Mark All Read'
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-medium flex items-center gap-2">
                                        <Bell className="h-5 w-5" />
                                        Recent Notifications
                                    </h3>
                                    <p className="text-sm text-muted-foreground">View and manage your recent notifications</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Select value={filter} onValueChange={(value: 'all' | 'unread' | 'read') => setFilter(value)}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="unread">Unread</SelectItem>
                                            <SelectItem value="read">Read</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {selectedNotifications.length > 0 && (
                                        <Button
                                            onClick={handleDeleteSelected}
                                            variant="outline"
                                            size="sm"
                                            disabled={loading}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Selected
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="rounded-md border">
                                {filteredNotifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center">
                                        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold">No notifications</h3>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            {filter === 'unread' ? 'No unread notifications' : 'No notifications to display'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {filteredNotifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`p-4 ${!notification.read ? 'bg-muted/30' : ''}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedNotifications.includes(notification.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedNotifications(prev => [...prev, notification.id])
                                                            } else {
                                                                setSelectedNotifications(prev => prev.filter(id => id !== notification.id))
                                                            }
                                                        }}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {getNotificationIcon(notification.type)}
                                                            <h4 className="font-medium">{notification.title}</h4>
                                                            {!notification.read && (
                                                                <Badge variant="default" className="text-xs">New</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mb-2">
                                                            {notification.message}
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(notification.timestamp).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                {notification.action && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => alert(`Action: ${notification.action}`)}
                                                                    >
                                                                        {notification.action}
                                                                    </Button>
                                                                )}
                                                                {!notification.read && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                                    >
                                                                        Mark as read
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteNotification(notification.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notification Preferences */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Notification Preferences
                                </h3>
                                <p className="text-sm text-muted-foreground">Choose how you want to receive notifications</p>
                            </div>
                            <div className="rounded-md border">
                                {preferences.map((preference, index) => (
                                    <div key={preference.id} className={`p-4 ${index !== preferences.length - 1 ? 'border-b' : ''}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h4 className="font-medium">{preference.title}</h4>
                                                <p className="text-sm text-muted-foreground">{preference.description}</p>
                                                <Badge variant="outline" className="mt-1 text-xs">
                                                    {preference.category}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">Email</span>
                                                </div>
                                                <Switch
                                                    checked={preference.email}
                                                    onCheckedChange={() => handlePreferenceToggle(preference.id, 'email')}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">Push</span>
                                                </div>
                                                <Switch
                                                    checked={preference.push}
                                                    onCheckedChange={() => handlePreferenceToggle(preference.id, 'push')}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">In-App</span>
                                                </div>
                                                <Switch
                                                    checked={preference.inApp}
                                                    onCheckedChange={() => handlePreferenceToggle(preference.id, 'inApp')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notification Rules */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-medium flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        Notification Rules
                                    </h3>
                                    <p className="text-sm text-muted-foreground">Automate your notification management</p>
                                </div>
                                <Button onClick={() => setShowRuleDialog(true)} variant="outline" size="sm" className="border-b-2">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Rule
                                </Button>
                            </div>
                            <div className="rounded-md border">
                                {rules.map((rule, index) => (
                                    <div key={rule.id} className={`p-4 ${index !== rules.length - 1 ? 'border-b' : ''}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-medium">{rule.name}</h4>
                                                    {rule.enabled && (
                                                        <Badge variant="default" className="text-xs">Active</Badge>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-sm text-muted-foreground">
                                                        <strong>Conditions:</strong> {rule.conditions.join(', ')}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        <strong>Actions:</strong> {rule.actions.join(', ')}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={rule.enabled}
                                                    onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                                                />
                                                <Button variant="ghost" size="sm">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Create Rule Dialog */}
            <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Notification Rule</DialogTitle>
                        <DialogDescription>
                            Set up automated rules for managing your notifications
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="rule-name">Rule Name</Label>
                            <Input
                                id="rule-name"
                                placeholder="e.g., Weekend Quiet Hours"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="conditions">Conditions</Label>
                            <Textarea
                                id="conditions"
                                placeholder="e.g., Priority: High, Type: Error"
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="actions">Actions</Label>
                            <Textarea
                                id="actions"
                                placeholder="e.g., Send Push Notification, Send Email"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRuleDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateRule}>
                            Create Rule
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
