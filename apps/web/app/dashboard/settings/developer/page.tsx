import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from "@/components/ui/badge"
import { Code, Terminal, Package, Globe, Zap } from "lucide-react"

export default async function DeveloperPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Developer Settings</h2>
        <p className="text-muted-foreground">Configure development tools and API access</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>Manage your API settings and endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">API Endpoint</div>
                <div className="text-sm text-muted-foreground">Configure your API base URL</div>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Rate Limiting</div>
                <div className="text-sm text-muted-foreground">Set API rate limits and quotas</div>
              </div>
              <Button variant="outline">Manage</Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Webhook URLs</div>
                <div className="text-sm text-muted-foreground">Configure webhook endpoints</div>
              </div>
              <Button variant="outline">Set up</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Development Tools</CardTitle>
          <CardDescription>Enable and configure developer tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Terminal className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">CLI Access</div>
                  <div className="text-sm text-muted-foreground">Enable command-line interface</div>
                </div>
              </div>
              <Badge variant="outline">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Debug Mode</div>
                  <div className="text-sm text-muted-foreground">Enable debugging features</div>
                </div>
              </div>
              <Badge variant="secondary">Disabled</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Performance Monitoring</div>
                  <div className="text-sm text-muted-foreground">Track application performance</div>
                </div>
              </div>
              <Badge variant="outline">Enabled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SDK & Libraries</CardTitle>
          <CardDescription>Download and configure SDKs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">JavaScript SDK</div>
                  <div className="text-sm text-muted-foreground">v2.1.0 • Node.js, Browser</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Globe className="h-4 w-4 mr-1" />
                  Docs
                </Button>
                <Button variant="outline" size="sm">Download</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Python SDK</div>
                  <div className="text-sm text-muted-foreground">v1.8.3 • Python 3.8+</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Globe className="h-4 w-4 mr-1" />
                  Docs
                </Button>
                <Button variant="outline" size="sm">Download</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Go SDK</div>
                  <div className="text-sm text-muted-foreground">v1.5.2 • Go 1.19+</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Globe className="h-4 w-4 mr-1" />
                  Docs
                </Button>
                <Button variant="outline" size="sm">Download</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>Manage your development environment configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Development Environment</label>
              <select className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground">
                <option>Development</option>
                <option>Staging</option>
                <option>Production</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">API Version</label>
              <select className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground">
                <option>v1.0 (Legacy)</option>
                <option selected>v2.0 (Current)</option>
                <option>v3.0 (Beta)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Default Region</label>
              <select className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground">
                <option>us-east-1</option>
                <option>us-west-2</option>
                <option>eu-west-1</option>
                <option>ap-southeast-1</option>
              </select>
            </div>

            <Button>Save developer settings</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Get started with development quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-muted rounded-lg">
              <div className="font-mono text-sm mb-2"># Install the CLI</div>
              <div className="font-mono text-sm">npm install -g @operone/cli</div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <div className="font-mono text-sm mb-2"># Initialize your project</div>
              <div className="font-mono text-sm">operone init my-project</div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="font-mono text-sm mb-2"># Start development server</div>
              <div className="font-mono text-sm">operone dev</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
