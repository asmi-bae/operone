import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, Plus, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

interface DashboardLayoutProps {
    children: React.ReactNode
    onNewChat?: () => void
}

export function DashboardLayout({ children, onNewChat }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Sidebar */}
            <div
                className={cn(
                    "flex-shrink-0 bg-muted/30 border-r transition-all duration-300 ease-in-out flex flex-col",
                    isSidebarOpen ? "w-[260px]" : "w-0 opacity-0 overflow-hidden"
                )}
            >
                <div className="p-3">
                    <Button
                        onClick={onNewChat}
                        variant="outline"
                        className="w-full justify-start gap-2 h-10 bg-background hover:bg-muted/50 border-muted-foreground/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New chat</span>
                    </Button>
                </div>

                <ScrollArea className="flex-1 px-3">
                    <div className="space-y-4 py-2">
                        <div className="px-2 text-xs font-medium text-muted-foreground/50">Today</div>
                        <div className="space-y-1">
                            {[1, 2, 3].map((i) => (
                                <Button
                                    key={i}
                                    variant="ghost"
                                    className="w-full justify-start text-sm font-normal h-9 px-2 overflow-hidden text-ellipsis whitespace-nowrap"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0 text-muted-foreground" />
                                    <span className="truncate">Previous Chat Session {i}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                </ScrollArea>

                <div className="p-3 border-t mt-auto">
                    <Button variant="ghost" className="w-full justify-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">U</span>
                        </div>
                        <span className="text-sm font-medium">User Account</span>
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Header / Toggle */}
                <div className="absolute top-3 left-3 z-10">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                    </Button>
                </div>

                {children}
            </div>
        </div>
    )
}
