import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LoginPageComponent from '@/components/login-page'

export default async function LoginPage() {
  const session = await auth()

  // If user is already logged in, redirect to dashboard
  if (session?.user) {
    redirect('/dashboard')
  }

  return <LoginPageComponent />
}
