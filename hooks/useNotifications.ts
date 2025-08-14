import { useState, useEffect, useCallback, useRef } from "react";
import { notificationsAPI } from "@/services/api";
import { useAuthError } from "./useAuthError";

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { handleAuthError } = useAuthError();

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    try {
      const data = await notificationsAPI.list();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (handleAuthError(err)) {
        return;
      }
      setError("Failed to fetch notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  const pollNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      await notificationsAPI.poll();
      await fetchNotifications();
    } catch (err: any) {
      if (handleAuthError(err)) {
        return;
      }
    }
  }, [fetchNotifications, handleAuthError]);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((n: any) => n.map((notif: any) => notif.id === id ? { ...notif, read: true } : notif));
    } catch (err: any) {
      if (handleAuthError(err)) {
        return;
      }
    }
  }, [handleAuthError]);

  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications(n => n.filter((notif: any) => notif.id !== id));
    } catch (err: any) {
      if (handleAuthError(err)) {
        return;
      }
    }
  }, [handleAuthError]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    fetchNotifications();
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(pollNotifications, 15000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchNotifications, pollNotifications]);

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return { notifications, unreadCount, loading, error, markAsRead, deleteNotification, pollNotifications };
} 