'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '@/services/api'

export default function VerifyPage() {
  const [isVerifying, setIsVerifying] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('No verification token provided')
        setIsVerifying(false)
        return
      }

      try {
        const response = await authAPI.verifyEmail(token);
        if (!response.ok) {
          throw new Error(response.error || 'Verification failed')
        }

        setIsVerified(true)
        toast.success('Email verified successfully!')
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Verification failed')
        toast.error('Email verification failed')
      } finally {
        setIsVerifying(false)
      }
    }

    verifyEmail()
  }, [token])

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying your email</h2>
          <p className="text-gray-600">Please wait while we verify your email address...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {isVerified ? (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. You can now sign in to your account.
            </p>
            <Button onClick={() => router.push('/login')} className="w-full">
              Sign In
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        ) : (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-4">
              {error || 'We couldn\'t verify your email address. The link may be expired or invalid.'}
            </p>
            <div className="space-y-3">
              <Button onClick={() => router.push('/login')} className="w-full">
                Go to Sign In
              </Button>
              <Link href="/register" className="block text-sm text-primary-600 hover:text-primary-500">
                Create a new account
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 