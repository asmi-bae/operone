import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export default async function NotificationsPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Notifications</h2>
        <p className="text-muted-foreground">Configure how you receive notifications</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Email Notifications</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Security alerts</div>
                <div className="text-sm text-muted-foreground">Get notified about security events</div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Account updates</div>
                <div className="text-sm text-muted-foreground">Receive updates about your account</div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Marketing emails</div>
                <div className="text-sm text-muted-foreground">Receive promotional content</div>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Push Notifications</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Desktop notifications</div>
                <div className="text-sm text-muted-foreground">Receive browser notifications</div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Mobile notifications</div>
                <div className="text-sm text-muted-foreground">Receive mobile app notifications</div>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Notification Frequency</h3>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-2">Email digest frequency</label>
            <select className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground">
              <option>Real-time</option>
              <option>Daily digest</option>
              <option>Weekly digest</option>
              <option>Never</option>
            </select>
          </div>
        </div>

        <div className="pt-4">
          <Button>Save notification preferences</Button>
        </div>
      </div>
    </div>
  )
}
