import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../types';

export function useNotifications(token: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const notifs = Array.isArray(data) ? data : [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => n.read === 0).length);
      }
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Polling 60s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        if (id === 'all') {
          setNotifications(prev => prev.map(n => ({...n, read: 1})));
          setUnreadCount(0);
        } else {
          setNotifications(prev => prev.map(n => n.id === id ? {...n, read: 1} : n));
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return { notifications, unreadCount, markAsRead, refetch: fetchNotifications };
}
