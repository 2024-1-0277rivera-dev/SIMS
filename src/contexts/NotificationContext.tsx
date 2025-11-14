

import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppNotification, UserRole } from '../types.ts';
import { getNotifications, STORAGE_KEYS } from '../services/api.ts';
import { useAuth } from '../hooks/useAuth.ts';
import { AMARANTH_JOKERS_TEAM_ID } from '../constants.ts';
import { useSyncedData } from '../hooks/useSyncedData.ts';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  loading: boolean;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: allNotifications, loading } = useSyncedData<AppNotification[]>(getNotifications, [STORAGE_KEYS.NOTIFICATIONS]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
        const storedReadIds = localStorage.getItem(`sims_read_notifs_${user.id}`);
        setReadIds(new Set(storedReadIds ? JSON.parse(storedReadIds) : []));
    } else {
        setReadIds(new Set());
    }
  }, [user]);

  useEffect(() => {
    if (!allNotifications) return;

    if (user) {
      const isPrivileged = user.role === UserRole.ADMIN || user.role === UserRole.OFFICER || user.teamId === AMARANTH_JOKERS_TEAM_ID;
      
      const filtered = allNotifications.filter((n: AppNotification) => {
          if (isPrivileged) {
              if (n.target?.userId && n.target.userId !== user.id) return false;
              return true;
          }
          if (!n.target) return true; // Public
          if (n.target.userId && n.target.userId === user.id) return true;
          if (n.target.roles && n.target.roles.includes(user.role)) {
              if (n.target.teamId) return n.target.teamId === user.teamId;
              return true;
          }
          return false;
      });
      setNotifications(filtered);
    } else {
      setNotifications(allNotifications.filter((n: AppNotification) => !n.target));
    }
  }, [allNotifications, user]);


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
