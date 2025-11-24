import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LoginPageComponent from '@/components/login-page'

export default async function LoginPageWrapper() {
  const session = await auth()

  // If user is already logged in and coming from desktop, redirect to auth-success
  if (session?.user) {
    // Check if this is a desktop login request
    // We'll handle this via URL params in the client component
    return <LoginPageComponent />
  }

  return <LoginPageComponent />
}
