// apps/frontend/src/hooks/useNotifications.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Post } from '../../../../packages/types/post';

// Define the shape of a notification
export interface Notification {
  id: number;
  type: 'NEW_COMMENT' | 'NEW_UPVOTE';
  read: boolean;
  createdAt: string;
  post: Post;
  sender: {
    username: string;
    avatar: string;
  };
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ✨ UPDATED: This function now fetches data more efficiently
  const fetchData = async () => {
    if (!user) return;
    try {
      // 1. Fetch the limited list of 5 notifications for the panel
      const notificationsPromise = fetch(`http://localhost:3001/api/notifications/${user.id}?cleared=false&limit=5`);
      
      // 2. Fetch the total unread count for the badge icon
      const countPromise = fetch(`http://localhost:3001/api/notifications/${user.id}/unread-count`);

      // Wait for both requests to complete at the same time
      const [notificationsResponse, countResponse] = await Promise.all([
        notificationsPromise,
        countPromise,
      ]);

      if (!notificationsResponse.ok || !countResponse.ok) {
        throw new Error('Failed to fetch notification data');
      }

      const notificationsData: Notification[] = await notificationsResponse.json();
      const countData = await countResponse.json();

      // Set the state with the results from our two separate API calls
      setNotifications(notificationsData);
      setUnreadCount(countData.count);

    } catch (error) {
      console.error('Failed to fetch notifications data:', error);
    }
  };

  const markAsRead = async () => {
    if (!user || unreadCount === 0) return;
    try {
      await fetch('http://localhost:3001/api/notifications/mark-as-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (!user || notifications.length === 0) return;
    try {
      await fetch('http://localhost:3001/api/notifications/clear-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData(); // Call the new, efficient function on load

      const interval = setInterval(fetchData, 30000); // Poll for new data

      return () => clearInterval(interval);
    } else {
      // If user logs out, clear the state
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  return { notifications, unreadCount, markAsRead, clearAllNotifications };
};