import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, CheckCircle } from "lucide-react"

export default async function SecurityLogPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Security Log</h2>
        <p className="text-muted-foreground">View your account security activity and events</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Monitor your account security activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="mt-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Successful login</div>
                  <div className="text-sm text-muted-foreground">2 hours ago</div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Logged in from Chrome on macOS • 192.168.1.1 • New York, US
                </div>
                <Badge variant="outline" className="mt-2">Success</Badge>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="mt-1">
                <Shield className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Password changed</div>
                  <div className="text-sm text-muted-foreground">2 days ago</div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Password successfully updated from Chrome on macOS
                </div>
                <Badge variant="outline" className="mt-2">Security</Badge>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="mt-1">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Failed login attempt</div>
                  <div className="text-sm text-muted-foreground">3 days ago</div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Incorrect password from unknown device • 185.123.45.67 • London, UK
                </div>
                <Badge variant="destructive" className="mt-2">Warning</Badge>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="mt-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Two-factor authentication enabled</div>
                  <div className="text-sm text-muted-foreground">1 week ago</div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  2FA successfully enabled for enhanced security
                </div>
                <Badge variant="outline" className="mt-2">Security</Badge>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="mt-1">
                <Shield className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Email address verified</div>
                  <div className="text-sm text-muted-foreground">2 weeks ago</div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Secondary email shoaib@example.com successfully verified
                </div>
                <Badge variant="outline" className="mt-2">Account</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Summary</CardTitle>
          <CardDescription>Overview of your account security status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-500">0</div>
              <div className="text-sm text-muted-foreground">Failed attempts (30 days)</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-500">5</div>
              <div className="text-sm text-muted-foreground">Successful logins (30 days)</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-500">Good</div>
              <div className="text-sm text-muted-foreground">Security score</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
