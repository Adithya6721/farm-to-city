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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from './auth-provider'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.'
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.'
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.'
  }),
  confirmPassword: z.string().min(6, {
    message: 'Password must be at least 6 characters.'
  }),
  role: z.enum(['farmer', 'trader', 'shopkeeper'], {
    required_error: 'Please select a role.'
  }),
  location: z.string().optional(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export function SignupForm() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: undefined,
      location: '',
      phone: '',
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    try {
      const { error } = await signUp(values.email, values.password, {
        name: values.name,
        role: values.role,
        location: values.location || undefined,
        phone: values.phone || undefined,
      })

      if (error) {
        toast.error('Sign up failed', {
          description: error.message || 'An error occurred during sign up.'
        })
        return
      }

      toast.success('Account created successfully!', {
        description: 'Please check your email to verify your account.'
      })
      
      // Redirect to login after successful signup
      router.push('/auth/login')
    } catch (error: any) {
      toast.error('Sign up failed', {
        description: error.message || 'An unexpected error occurred.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='text-center mb-6'>
        <h1 className='text-3xl font-bold'>Create Account</h1>
        <p className='text-gray-500'>Sign up to start trading on Farm2City</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }: { field: ControllerRenderProps<z.infer<typeof formSchema>, "name"> }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder='John Doe' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='email'
            render={({ field }: { field: ControllerRenderProps<z.infer<typeof formSchema>, "email"> }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type='email' placeholder='john@example.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='role'
            render={({ field }: { field: ControllerRenderProps<z.infer<typeof formSchema>, "role"> }) => (
              <FormItem>
                <FormLabel>I am a</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select your role' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='farmer'>🌾 Farmer</SelectItem>
                    <SelectItem value='trader'>🚚 Trader</SelectItem>
                    <SelectItem value='shopkeeper'>🏪 Shopkeeper</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }: { field: ControllerRenderProps<z.infer<typeof formSchema>, "password"> }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type='password' placeholder='******' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }: { field: ControllerRenderProps<z.infer<typeof formSchema>, "confirmPassword"> }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type='password' placeholder='******' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='location'
            render={({ field }: { field: ControllerRenderProps<z.infer<typeof formSchema>, "location"> }) => (
              <FormItem>
                <FormLabel>Location (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder='City, State' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='phone'
            render={({ field }: { field: ControllerRenderProps<z.infer<typeof formSchema>, "phone"> }) => (
              <FormItem>
                <FormLabel>Phone (Optional)</FormLabel>
                <FormControl>
                  <Input type='tel' placeholder='+1234567890' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>
      </Form>
      <div className='text-center mt-4'>
        <p className='text-sm text-gray-600'>
          Already have an account?{' '}
          <Link href='/auth/login' className='text-blue-600 hover:underline'>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

