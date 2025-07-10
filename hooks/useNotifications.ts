import { useState, useEffect, useCallback } from "react";
import { notificationsAPI } from "@/services/api";

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationsAPI.list();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to fetch notifications");
      setNotifications([]); // Ensure notifications is always an array on error
    } finally {
      setLoading(false);
    }
  }, []);

  const pollNotifications = useCallback(async () => {
    try {
      await notificationsAPI.poll();
      await fetchNotifications();
    } catch {}
  }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    await notificationsAPI.markAsRead(id);
    setNotifications((n: any) => n.map((notif: any) => notif.id === id ? { ...notif, read: true } : notif));
  };

  const deleteNotification = async (id: number) => {
    await notificationsAPI.delete(id);
    setNotifications(n => n.filter((notif: any) => notif.id !== id));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(pollNotifications, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [fetchNotifications, pollNotifications]);

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return { notifications, unreadCount, loading, error, markAsRead, deleteNotification, pollNotifications };
} 