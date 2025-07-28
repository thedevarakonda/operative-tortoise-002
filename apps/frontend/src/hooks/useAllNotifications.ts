// apps/frontend/src/hooks/useAllNotifications.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Notification } from './useNotifications'; // Reuse the same type

export const useAllNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllNotifications = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Fetch all notifications *without* providing a limit
        const response = await fetch(`http://localhost:3001/api/notifications/${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch all notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllNotifications();
  }, [user]);

  return { notifications, isLoading };
};