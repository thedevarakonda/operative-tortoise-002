// apps/frontend/src/hooks/useNotifications.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Post } from '../../../../packages/types/post'; // Adjust path if needed

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

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await fetch(`http://localhost:3001/api/notifications/${user.id}`);
      const data: Notification[] = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
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
      // After marking as read, update the state locally
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Optional: Set up polling to check for new notifications periodically
    const interval = setInterval(fetchNotifications, 30000); // every 30 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [user]);

  return { notifications, unreadCount, markAsRead };
};