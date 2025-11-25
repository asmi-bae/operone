import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AccessibilityPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Accessibility</h2>
        <p className="text-muted-foreground">Configure accessibility options to make the app easier to use</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visual Preferences</CardTitle>
          <CardDescription>Adjust visual settings for better accessibility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">High contrast mode</div>
                <div className="text-sm text-muted-foreground">Increase contrast for better visibility</div>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Large text</div>
                <div className="text-sm text-muted-foreground">Increase text size for better readability</div>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Reduce motion</div>
                <div className="text-sm text-muted-foreground">Minimize animations and transitions</div>
              </div>
              <Switch />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Font size</label>
              <select className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground">
                <option>Small</option>
                <option selected>Medium</option>
                <option>Large</option>
                <option>Extra Large</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keyboard Navigation</CardTitle>
          <CardDescription>Configure keyboard shortcuts and navigation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Skip to main content</div>
                <div className="text-sm text-muted-foreground">Show skip links for keyboard navigation</div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Focus indicators</div>
                <div className="text-sm text-muted-foreground">Enhance focus visibility</div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Screen Reader Support</CardTitle>
          <CardDescription>Optimize experience for screen readers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Enhanced labels</div>
                <div className="text-sm text-muted-foreground">Provide more descriptive labels</div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Announce page changes</div>
                <div className="text-sm text-muted-foreground">Announce dynamic content updates</div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pt-4">
        <Button>Save accessibility preferences</Button>
      </div>
    </div>
  )
}
