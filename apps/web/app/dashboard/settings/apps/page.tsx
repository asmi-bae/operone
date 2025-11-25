import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from "@/components/ui/badge"
import { Smartphone, Plus, Settings, Trash2, Key } from "lucide-react"

export default async function AppsPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Apps & OAuth</h2>
        <p className="text-muted-foreground">Manage your connected applications and OAuth tokens</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>OAuth Apps</CardTitle>
              <CardDescription>Applications authorized to access your account</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New App
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Mobile App</div>
                  <div className="text-sm text-muted-foreground">Official mobile application</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">Active</Badge>
                    <Badge variant="secondary">Read & Write</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </Button>
                <Button variant="outline" size="sm">Revoke</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Desktop Client</div>
                  <div className="text-sm text-muted-foreground">Desktop application client</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">Active</Badge>
                    <Badge variant="secondary">Read only</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </Button>
                <Button variant="outline" size="sm">Revoke</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Personal Access Tokens</CardTitle>
              <CardDescription>Manage your API access tokens</CardDescription>
            </div>
            <Button>
              <Key className="h-4 w-4 mr-2" />
              Generate Token
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Development Token</div>
                  <div className="text-sm text-muted-foreground">Created 2 weeks ago</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">Active</Badge>
                    <Badge variant="secondary">Full access</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Regenerate</Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">CI/CD Token</div>
                  <div className="text-sm text-muted-foreground">Created 1 month ago</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">Active</Badge>
                    <Badge variant="secondary">Deploy access</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Regenerate</Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Devices and browsers currently logged into your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">Chrome on macOS</div>
                  <div className="text-sm text-muted-foreground">Current session • New York, US</div>
                  <div className="text-xs text-muted-foreground mt-1">Last active: Now</div>
                </div>
              </div>
              <Badge variant="outline">Current</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Safari on iPhone</div>
                  <div className="text-sm text-muted-foreground">Mobile app • San Francisco, US</div>
                  <div className="text-xs text-muted-foreground mt-1">Last active: 2 hours ago</div>
                </div>
              </div>
              <Button variant="outline" size="sm">Sign out</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
          <CardDescription>Keep your account secure with these tips</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-sm">Use unique tokens for each application</div>
                <div className="text-sm text-muted-foreground">Generate separate tokens for different use cases</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-sm">Regularly review authorized apps</div>
                <div className="text-sm text-muted-foreground">Remove apps you no longer use</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-sm">Set token expiration dates</div>
                <div className="text-sm text-muted-foreground">Consider setting expiration for long-term tokens</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
