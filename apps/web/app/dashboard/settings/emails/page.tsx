import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from "@/components/ui/badge"
import { Mail, Check, X } from "lucide-react"

export default async function EmailsPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Emails</h2>
        <p className="text-muted-foreground">Manage your email addresses and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Addresses</CardTitle>
          <CardDescription>Add and manage email addresses for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">khan2310310484@g.edu.bd</div>
                  <div className="text-sm text-muted-foreground">Primary email</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="gap-1">
                  <Check className="h-3 w-3" />
                  Verified
                </Badge>
                <Badge variant="secondary">Primary</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">shoaib@example.com</div>
                  <div className="text-sm text-muted-foreground">Secondary email</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <X className="h-3 w-3" />
                  Not verified
                </Badge>
                <Button variant="outline" size="sm">Verify</Button>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Add email address
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Preferences</CardTitle>
          <CardDescription>Control which emails you receive</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Manage your email notification preferences in the{" "}
              <a href="/dashboard/settings/notifications" className="text-blue-500 hover:underline">
                notifications settings
              </a>.
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email History</CardTitle>
          <CardDescription>View recent emails sent to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              No email history available
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
