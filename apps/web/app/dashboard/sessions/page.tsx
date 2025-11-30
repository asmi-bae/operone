'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, Shield, Smartphone, Mail, RefreshCw } from 'lucide-react'

interface Session {
    id: string
    device: string
    location: string
    lastActive: string
    current: boolean
}

export default function SessionsPage() {
    const [showSessionDialog, setShowSessionDialog] = useState(false)
    const [selectedSession, setSelectedSession] = useState<Session | null>(null)
    const [activeSessions, setActiveSessions] = useState<Session[]>([])
    const [sessionsLoading, setSessionsLoading] = useState(true)

    // Fetch sessions data on component mount
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await fetch('/api/sessions')
                if (response.ok) {
                    const data = await response.json()
                    setActiveSessions(data.sessions || [])
                }
            } catch {
                console.error('Failed to fetch sessions')
            } finally {
                setSessionsLoading(false)
            }
        }

        fetchSessions()
    }, [])

    // Show loading state while data is being fetched
    if (sessionsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    const handleRevokeSession = async (sessionId: string) => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            setActiveSessions(prev => prev.filter(session => session.id !== sessionId))
            setShowSessionDialog(false)
            setSelectedSession(null)
            
            alert('Session revoked successfully')
        } catch {
            alert('Failed to revoke session')
        }
    }

    const handleRevokeAllSessions = async () => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            setActiveSessions(prev => prev.filter(session => session.current))
            alert('All other sessions revoked successfully')
        } catch {
            alert('Failed to revoke sessions')
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
                                <h1 className="text-2xl font-bold">Active Sessions</h1>
                                <p className="text-muted-foreground">View and manage your active login sessions</p>
                            </div>
                        </div>

                        {/* Active Sessions */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Active Sessions
                                </h3>
                                <p className="text-sm text-muted-foreground">Manage and monitor your active login sessions</p>
                            </div>
                            <div className="rounded-md border">
                                <div className="flex items-center justify-between p-4 border-b">
                                    <p className="text-sm text-muted-foreground">
                                        {activeSessions.length} active session{activeSessions.length !== 1 ? 's' : ''}
                                    </p>
                                    <Button onClick={handleRevokeAllSessions} variant="outline" size="sm">
                                        Revoke All Other Sessions
                                    </Button>
                                </div>
                                {activeSessions.map((session, index) => (
                                    <div key={session.id} className={`flex items-center justify-between p-4 ${index !== activeSessions.length - 1 ? 'border-b' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                                {session.current ? (
                                                    <Shield className="h-5 w-5 text-primary" />
                                                ) : (
                                                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{session.device}</p>
                                                <p className="text-sm text-muted-foreground">{session.location}</p>
                                                <p className="text-xs text-muted-foreground">Last active: {session.lastActive}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {session.current && (
                                                <Badge variant="default" className="text-xs">Current</Badge>
                                            )}
                                            {!session.current && (
                                                <Button
                                                    onClick={() => {
                                                        setSelectedSession(session)
                                                        setShowSessionDialog(true)
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Revoke
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Security Recommendations */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="font-medium flex items-center gap-2">
                                    <RefreshCw className="h-5 w-5" />
                                    Session Recommendations
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {activeSessions.length > 3 && (
                                    <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <RefreshCw className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-blue-800">Review Active Sessions</p>
                                            <p className="text-sm text-blue-700">
                                                You have multiple active sessions. Consider revoking any you don&apos;t recognize.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Revoke Session Dialog */}
            <AlertDialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Session?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to revoke the session for {selectedSession?.device}?
                            This will log out that device immediately.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => selectedSession && handleRevokeSession(selectedSession.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Revoke Session
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
