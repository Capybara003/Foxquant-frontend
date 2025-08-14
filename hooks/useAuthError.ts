'use client'

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import toast from 'react-hot-toast';

export function useAuthError() {
  const router = useRouter();

  const handleAuthError = useCallback((error: any) => {
    if (error.message?.includes('Authentication failed') || error.message?.includes('401')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      toast.error('Session expired. Please log in again.');
      router.push('/login');
      return true;
    }
    return false;
  }, [router]);

  return { handleAuthError };
} 