'use client'

import { useAuth } from '@/contexts/AuthContext'
import NotificationsBell from './NotificationsBell'

export function ConditionalNotificationsBell() {
  const { user, isLoading } = useAuth()

  if (isLoading || !user) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <NotificationsBell />
    </div>
  )
} 