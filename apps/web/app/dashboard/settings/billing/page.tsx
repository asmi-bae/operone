import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function BillingPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Billing</h2>
        <p className="text-muted-foreground">Manage your subscription and payment methods</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your current subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">Free Plan</div>
                <div className="text-sm text-muted-foreground">Basic features with limited access</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm">
                <div className="font-medium">Features included:</div>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  <li>• 5 active projects</li>
                  <li>• Basic support</li>
                  <li>• 1GB storage</li>
                </ul>
              </div>
            </div>
            
            <Button>Upgrade to Pro</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              No payment methods added
            </div>
            <Button variant="outline">Add payment method</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              No billing history available
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
