'use client'
import { useNotifications } from "@/hooks/useNotifications";
import Button from "./Button";
import { useState, useRef, useEffect, useCallback, memo } from "react";

const NotificationsBell = memo(() => {
  const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
  }, []);

  const toggleOpen = useCallback(() => {
    setOpen(v => !v);
  }, []);

  const handleMarkAsRead = useCallback((id: number) => {
    markAsRead(id);
  }, [markAsRead]);

  const handleDeleteNotification = useCallback((id: number) => {
    deleteNotification(id);
  }, [deleteNotification]);

  useEffect(() => {
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, handleClick]);

  return (
    <div className="relative" ref={ref}>
      <Button variant="primary" onClick={toggleOpen}>
        <span className="relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {unreadCount}
            </span>
          )}
        </span>
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2 font-semibold border-b">Notifications</div>
          {notifications.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">No notifications</div>
          ) : (
            notifications.map((n: any) => (
              <div key={n.id} className={`flex items-start gap-2 px-4 py-2 border-b last:border-b-0 ${n.read ? 'bg-white' : 'bg-blue-50'}`}>
                <div className="flex-1">
                  <div className="text-sm font-medium">{n.type}</div>
                  <div className="text-xs text-gray-700">{n.message}</div>
                  <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                {!n.read && (
                  <button className="text-xs text-blue-600 underline" onClick={() => handleMarkAsRead(n.id)}>Mark as read</button>
                )}
                <button className="text-xs text-gray-400 ml-2" onClick={() => handleDeleteNotification(n.id)} title="Delete">✕</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
});

NotificationsBell.displayName = 'NotificationsBell';

export default NotificationsBell; 