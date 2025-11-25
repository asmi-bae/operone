import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { PasskeyManagement } from '@/components/passkey-management'

export default async function PasskeysPage() {
    const session = await auth()

    if (!session) {
        redirect('/login')
    }

    return (
        <div className="space-y-4 px-2 sm:px-0">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold mb-1">Passkeys</h1>
                <p className="text-muted-foreground text-sm">Manage your passkeys for secure authentication</p>
            </div>

            <Card className='border-none'>
                <CardContent className="w-full border-t border-b px-2 sm:px-0 py-6">
                    <PasskeyManagement />
                </CardContent>
            </Card>
        </div>
    )
}
