'use client'
import { useAuth } from '@/contexts/AuthContext';

// Backward compatibility hook - redirects to new AuthContext
export function useAuthLogic() {
  return useAuth();
}