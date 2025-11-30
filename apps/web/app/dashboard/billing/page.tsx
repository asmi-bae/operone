'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, CreditCard, Calendar, AlertTriangle, Crown, Star } from 'lucide-react'

interface BillingPlan {
    id: string
    name: string
    price: number
    interval: 'monthly' | 'yearly'
    features: string[]
    popular?: boolean
    current?: boolean
}

export default function BillingPage() {
    const [loading, setLoading] = useState(false)
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
    const [showPaymentDialog, setShowPaymentDialog] = useState(false)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState('pro')
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')

    // Billing plans state
    const [plans] = useState<BillingPlan[]>([])

    const handleUpgradePlan = async () => {
        setLoading(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 3000))
            
            setShowUpgradeDialog(false)
            alert('Plan upgraded successfully')
        } catch {
            alert('Failed to upgrade plan')
        } finally {
            setLoading(false)
        }
    }

    const handleAddPaymentMethod = async () => {
        setShowPaymentDialog(false)
        alert('Payment method added successfully')
    }

    const handleCancelSubscription = async () => {
        setLoading(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            setShowCancelDialog(false)
            alert('Subscription cancelled successfully')
        } catch {
            alert('Failed to cancel subscription')
        } finally {
            setLoading(false)
        }
    }

    const getPlanPrice = (plan: BillingPlan) => {
        if (billingInterval === 'yearly' && plan.price > 0) {
            const yearlyPrice = plan.price * 12 * 0.8 // 20% discount for yearly
            return Math.round(yearlyPrice)
        }
        return plan.price
    }

    return (
        <div className="space-y-4 px-2 sm:px-0">
            <Card className='border-none'>
                <CardContent className="w-full border-b px-2 sm:px-0 py-6">
                    <div className="space-y-6">
                        {/* Page Header */}
                        <div className="flex items-center justify-between border-b pb-4">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold">Billing</h1>
                                <p className="text-muted-foreground">Manage your subscription, payment methods, and billing history</p>
                            </div>
                        </div>

                        {/* Current Plan */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Crown className="h-5 w-5" />
                                    Current Plan
                                </h3>
                                <p className="text-sm text-muted-foreground">Your current subscription and usage</p>
                            </div>
                            <div className="rounded-md border">
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <Crown className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold">No active subscription</h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Choose a plan to get started with premium features
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Available Plans */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Star className="h-5 w-5" />
                                    Available Plans
                                </h3>
                                <p className="text-sm text-muted-foreground">Choose the plan that best fits your needs</p>
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <Label>Billing Interval</Label>
                                <Select value={billingInterval} onValueChange={(value: 'monthly' | 'yearly') => setBillingInterval(value)}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="yearly">Yearly (Save 20%)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="rounded-md border">
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <Star className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold">No plans available</h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Contact support to configure billing plans
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-medium flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Payment Methods
                                    </h3>
                                    <p className="text-sm text-muted-foreground">Manage your payment methods</p>
                                </div>
                                <Button onClick={() => setShowPaymentDialog(true)} variant="outline" size="sm">
                                    Add Payment Method
                                </Button>
                            </div>
                            <div className="rounded-md border">
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold">No payment methods</h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Add a payment method to manage your subscription
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Billing History */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Billing History
                                </h3>
                                <p className="text-sm text-muted-foreground">View and download your invoices</p>
                            </div>
                            <div className="rounded-md border">
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold">No billing history</h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Your invoices will appear here once you have an active subscription
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Billing Settings */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="font-medium flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Billing Settings
                                </h3>
                                <p className="text-sm text-muted-foreground">Configure your billing preferences</p>
                            </div>
                            <div className="rounded-md border">
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold">No billing settings</h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Billing settings will be available once you have an active subscription
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="font-medium text-destructive">Danger Zone</h3>
                                <p className="text-sm text-muted-foreground">Irreversible actions for your subscription</p>
                            </div>
                            <div className="rounded-md border">
                                <div className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="font-medium text-destructive">Cancel Subscription</p>
                                        <p className="text-sm text-muted-foreground">
                                            Cancel your subscription and lose access to premium features
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => setShowCancelDialog(true)}
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                    >
                                        Cancel Subscription
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Upgrade Plan Dialog */}
            <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upgrade Your Plan</DialogTitle>
                        <DialogDescription>
                            Choose the plan that best fits your needs
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-3">
                            {plans.filter(p => !p.current).map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`rounded-lg border p-4 cursor-pointer transition-all ${
                                        selectedPlan === plan.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                    onClick={() => setSelectedPlan(plan.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">{plan.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                ${getPlanPrice(plan)}/{billingInterval === 'yearly' ? 'year' : 'month'}
                                            </p>
                                        </div>
                                        <div className="w-4 h-4 rounded-full border-2 border-primary">
                                            {selectedPlan === plan.id && (
                                                <div className="w-2 h-2 rounded-full bg-primary m-0.5" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpgradePlan} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Upgrade Now'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Payment Method Dialog */}
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                        <DialogDescription>
                            Add a new credit card or bank account
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="card-number">Card Number</Label>
                            <Input
                                id="card-number"
                                placeholder="4242 4242 4242 4242"
                                maxLength={19}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="expiry">Expiry Date</Label>
                                <Input
                                    id="expiry"
                                    placeholder="MM/YY"
                                    maxLength={5}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input
                                    id="cvv"
                                    placeholder="123"
                                    maxLength={4}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Cardholder Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddPaymentMethod}>
                            Add Payment Method
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Subscription Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel your subscription? You will lose access to all premium features at the end of your billing period.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelSubscription}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cancelling...
                                </>
                            ) : (
                                'Cancel Subscription'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
