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
import { Loader2, Mail, Plus, Check, X, Send, Clock } from 'lucide-react'

interface EmailTemplate {
    id: string
    name: string
    subject: string
    category: string
    enabled: boolean
    lastUsed?: string
}

interface EmailLog {
    id: string
    to: string
    subject: string
    status: 'sent' | 'delivered' | 'failed' | 'bounced'
    timestamp: string
    templateId?: string
}

export default function EmailsPage() {
    const [loading, setLoading] = useState(false)
    const [showTemplateDialog, setShowTemplateDialog] = useState(false)
    const [filter, setFilter] = useState<'all' | 'sent' | 'delivered' | 'failed'>('all')

    // Email templates state - will be fetched from API
    const [templates, setTemplates] = useState<EmailTemplate[]>([])
    const [templatesLoading, setTemplatesLoading] = useState(true)

    // Email logs state - will be fetched from API
    const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])
    const [logsLoading, setLogsLoading] = useState(true)

    // Fetch email data on component mount
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await fetch('/api/emails')
                if (response.ok) {
                    const data = await response.json()
                    setTemplates(data.templates || [])
                }
            } catch {
                console.error('Failed to fetch email templates')
            } finally {
                setTemplatesLoading(false)
            }
        }

        const fetchLogs = async () => {
            try {
                const response = await fetch('/api/emails/logs')
                if (response.ok) {
                    const data = await response.json()
                    setEmailLogs(data.logs || [])
                }
            } catch {
                console.error('Failed to fetch email logs')
            } finally {
                setLogsLoading(false)
            }
        }

        fetchTemplates()
        fetchLogs()
    }, [])

    // Show loading state while data is being fetched
    if (templatesLoading || logsLoading) {
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

    const handleToggleTemplate = (templateId: string, enabled: boolean) => {
        setTemplates(prev =>
            prev.map(template =>
                template.id === templateId
                    ? { ...template, enabled }
                    : template
            )
        )
    }

    const handleSendTestEmail = async () => {
        setLoading(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            alert('Test email sent successfully')
        } catch {
            alert('Failed to send test email')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateTemplate = async () => {
        setShowTemplateDialog(false)
        alert('Email template created successfully')
    }

    const getStatusIcon = (status: EmailLog['status']) => {
        switch (status) {
            case 'sent': return <Clock className="h-4 w-4 text-blue-500" />
            case 'delivered': return <Check className="h-4 w-4 text-green-500" />
            case 'failed': return <X className="h-4 w-4 text-red-500" />
            case 'bounced': return <X className="h-4 w-4 text-orange-500" />
        }
    }

    const getStatusBadge = (status: EmailLog['status']) => {
        const variants = {
            sent: 'secondary',
            delivered: 'default',
            failed: 'destructive',
            bounced: 'secondary'
        } as const

        return (
            <Badge variant={variants[status]} className="text-xs">
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        )
    }

    const filteredLogs = emailLogs.filter(log => {
        if (filter === 'all') return true
        return log.status === filter
    })

    return (
        <div className="space-y-4 px-2 sm:px-0">
            <Card className='border-none'>
                <CardContent className="w-full border-b px-2 sm:px-0 py-6">
                    <div className="space-y-6">
                        {/* Page Header */}
                        <div className="flex items-center justify-between border-b pb-4">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold">Email Management</h1>
                                <p className="text-muted-foreground">Manage email templates and delivery logs</p>
                            </div>
                            <Button onClick={() => setShowTemplateDialog(true)} variant="outline" size="sm" className="border-b-2">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Template
                            </Button>
                        </div>

                        {/* Email Templates */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Email Templates
                                </h3>
                                <p className="text-sm text-muted-foreground">Manage your email templates and their settings</p>
                            </div>
                            <div className="rounded-md border">
                                {templates.map((template, index) => (
                                    <div key={template.id} className={`p-4 ${index !== templates.length - 1 ? 'border-b' : ''}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-medium">{template.name}</h4>
                                                    <Badge variant="outline" className="text-xs">{template.category}</Badge>
                                                    {template.enabled && (
                                                        <Badge variant="default" className="text-xs">Active</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-1">
                                                    Subject: {template.subject}
                                                </p>
                                                {template.lastUsed && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Last used: {new Date(template.lastUsed).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={template.enabled}
                                                    onCheckedChange={(checked) => handleToggleTemplate(template.id, checked)}
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleSendTestEmail()}
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Sending...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="h-4 w-4 mr-2" />
                                                            Test
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Email Logs */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-medium flex items-center gap-2">
                                        <Mail className="h-5 w-5" />
                                        Email Logs
                                    </h3>
                                    <p className="text-sm text-muted-foreground">View recent email delivery status</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Select value={filter} onValueChange={(value: 'all' | 'sent' | 'delivered' | 'failed') => setFilter(value)}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="sent">Sent</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                            <SelectItem value="failed">Failed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="rounded-md border">
                                <div className="divide-y">
                                    {filteredLogs.map((log) => (
                                        <div key={log.id} className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {getStatusIcon(log.status)}
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-medium">{log.subject}</h4>
                                                            {getStatusBadge(log.status)}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            To: {log.to}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(log.timestamp).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Create Template Dialog */}
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Email Template</DialogTitle>
                        <DialogDescription>
                            Create a new email template for automated communications
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="template-name">Template Name</Label>
                            <Input
                                id="template-name"
                                placeholder="e.g., Welcome Email"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                placeholder="Email subject line"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="onboarding">Onboarding</SelectItem>
                                    <SelectItem value="security">Security</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="billing">Billing</SelectItem>
                                    <SelectItem value="notifications">Notifications</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                placeholder="Email content (HTML supported)"
                                rows={6}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateTemplate}>
                            Create Template
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
