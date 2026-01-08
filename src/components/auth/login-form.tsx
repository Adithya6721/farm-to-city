'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, ControllerRenderProps } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'
import { toast } from 'sonner'
import { useState } from 'react'

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.'
  })
})

export function LoginForm() {
  const router = useRouter()
  const { signIn, user, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    try {
      const { error } = await signIn(values.email, values.password)

      if (error) {
        // Error is already handled in auth provider with toast
        setIsLoading(false)
        return
      }

      // Wait for auth state to update and user profile to load
      // Poll for user to be loaded (up to 3 seconds)
      let attempts = 0
      const maxAttempts = 6
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500))
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          // Give a moment for profile to load
          await new Promise(resolve => setTimeout(resolve, 300))
          break
        }
        attempts++
      }
      
      toast.success('Welcome back!', {
        description: 'You have been successfully logged in.'
      })
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error: any) {
      toast.error('Login failed', {
        description: error.message || 'An unexpected error occurred.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='text-center mb-6'>
        <h1 className='text-3xl font-bold'>Welcome Back</h1>
        <p className='text-gray-500'>Sign in to your account to continue</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }: { field: ControllerRenderProps<{ email: string; password: string }, "email"> }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder='sadithya032006@gmail.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }: { field: ControllerRenderProps<{ email: string; password: string }, "password"> }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type='password' placeholder='******' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Form>
      <div className='text-center mt-4'>
        <p className='text-sm text-gray-600'>
          Don&apos;t have an account?{' '}
          <Link href='/auth/signup' className='text-blue-600 hover:underline'>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

