
import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppNotification } from '../types.ts';
import { getNotifications } from '../services/api.ts';
import { useAuth } from '../hooks/useAuth.ts';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  loading: boolean;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const pollIntervalRef = useRef<number | null>(null);

  // Load user's read status from localStorage
  useEffect(() => {
    if (user) {
        const storedReadIds = localStorage.getItem(`sims_read_notifs_${user.id}`);
        if (storedReadIds) {
            setReadIds(new Set(JSON.parse(storedReadIds)));
        } else {
            setReadIds(new Set());
        }
    } else {
        setReadIds(new Set());
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 5 seconds
    pollIntervalRef.current = window.setInterval(fetchNotifications, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchNotifications]);

  const markAsRead = (id: string) => {
    setReadIds(prev => {
      const newSet = new Set(prev).add(id);
      if (user) {
          localStorage.setItem(`sims_read_notifs_${user.id}`, JSON.stringify(Array.from(newSet)));
      }
      return newSet;
    });
  };

  const markAllAsRead = () => {
      setReadIds(prev => {
          const newSet = new Set(prev);
          notifications.forEach(n => newSet.add(n.id));
          if (user) {
              localStorage.setItem(`sims_read_notifs_${user.id}`, JSON.stringify(Array.from(newSet)));
          }
          return newSet;
      });
  }

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const enhancedNotifications = notifications.map(n => ({
      ...n,
      read: readIds.has(n.id)
  })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <NotificationContext.Provider value={{ notifications: enhancedNotifications, unreadCount, markAsRead, markAllAsRead, loading }}>
      {children}
    </NotificationContext.Provider>
  );
};
