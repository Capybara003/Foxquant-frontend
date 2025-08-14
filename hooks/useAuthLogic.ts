'use client'
import { useAuth } from '@/contexts/AuthContext';

export function useAuthLogic() {
  return useAuth();
}