import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from "@/components/ui/badge"
import { Package, Plus, ExternalLink, Star, GitBranch } from "lucide-react"

export default async function RepositoriesPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Repositories</h2>
        <p className="text-muted-foreground">Manage your connected repositories and integrations</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Connected Repositories</CardTitle>
              <CardDescription>Repositories linked to your account</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Connect Repository
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">operone</div>
                  <div className="text-sm text-muted-foreground">Main application repository</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="gap-1">
                      <GitBranch className="h-3 w-3" />
                      main
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Star className="h-3 w-3" />
                      42
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">Disconnect</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">core-engine</div>
                  <div className="text-sm text-muted-foreground">Core engine package</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="gap-1">
                      <GitBranch className="h-3 w-3" />
                      develop
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Star className="h-3 w-3" />
                      15
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">Disconnect</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">mcp-server</div>
                  <div className="text-sm text-muted-foreground">MCP server implementation</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="gap-1">
                      <GitBranch className="h-3 w-3" />
                      main
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Star className="h-3 w-3" />
                      8
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">Disconnect</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Repository Statistics</CardTitle>
          <CardDescription>Overview of your repository activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-muted-foreground">Total Repositories</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">65</div>
              <div className="text-sm text-muted-foreground">Total Stars</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">247</div>
              <div className="text-sm text-muted-foreground">Total Commits</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">Active Contributors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Settings</CardTitle>
          <CardDescription>Configure repository integrations and webhooks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto-sync repositories</div>
                <div className="text-sm text-muted-foreground">Automatically sync repository data</div>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Webhook endpoints</div>
                <div className="text-sm text-muted-foreground">Manage webhook URLs and events</div>
              </div>
              <Button variant="outline">Manage</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
