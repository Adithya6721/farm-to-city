import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'

export default function HomePage() {
  // For now, redirect to login page
  // In production, you might want to show a landing page
  redirect('/auth/login')
}

