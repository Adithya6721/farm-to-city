import { toast } from 'sonner'
import { PostgrestError } from '@supabase/supabase-js'

export interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  defaultMessage?: string
}

/**
 * Handles Supabase errors and displays user-friendly messages
 */
export function handleSupabaseError(
  error: PostgrestError | Error | unknown | null | undefined,
  options: ErrorHandlerOptions = {}
): string {
  const {
    showToast = true,
    logError = true,
    defaultMessage = 'An error occurred. Please try again.'
  } = options

  if (!error) {
    return defaultMessage
  }

  let errorMessage = defaultMessage

  // Handle PostgrestError (Supabase database errors)
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    const pgError = error as PostgrestError
    
    switch (pgError.code) {
      case 'PGRST116':
        errorMessage = 'No data found.'
        break
      case '23505':
        errorMessage = 'This record already exists.'
        break
      case '23503':
        errorMessage = 'Related record not found.'
        break
      case '42501':
        errorMessage = 'You do not have permission to perform this action.'
        break
      case '42P01':
        errorMessage = 'Database table not found. Please contact support.'
        break
      default:
        errorMessage = pgError.message || defaultMessage
    }
  } else if (error instanceof Error) {
    errorMessage = error.message || defaultMessage
  } else if (typeof error === 'string') {
    errorMessage = error
  }

  if (logError) {
    console.error('Error:', error)
  }

  if (showToast) {
    toast.error('Operation failed', {
      description: errorMessage
    })
  }

  return errorMessage
}

/**
 * Wraps an async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<T | null> {
  try {
    return await fn()
  } catch (error) {
    handleSupabaseError(error as Error, options)
    return null
  }
}

