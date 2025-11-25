import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { Sparkles, LogOut, User as UserIcon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/contexts/auth-context"
import { UserAvatar } from "@/components/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppHeader() {
  const { user, logout } = useAuth()

  const handleUpgradeConfirm = () => {
    window.open('https://operone.vercel.app/#pricing', '_blank')
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <Header className="justify-between items-center gap-0">
      <div className="flex items-center gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="rounded-full font-semibold px-4 py-1.5 flex items-center gap-1.5 bg-purple-100/80 hover:bg-purple-200/90 border text-purple-700 hover:text-purple-800 text-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Upgrade to Pro
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-sm border-0">
            <AlertDialogHeader>
              <AlertDialogTitle>Upgrade to Pro</AlertDialogTitle>
              <AlertDialogDescription>
                Unlock advanced features, unlimited access, and priority support.
                Would you like to view our pricing plans?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleUpgradeConfirm}>
                View Pricing
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex items-center gap-2">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <UserAvatar
                  user={user}
                  className="h-8 w-8"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.open('https://operone.vercel.app/dashboard/account', '_blank')}>
                <UserIcon className="mr-2 h-4 w-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </Header>
  )
}
