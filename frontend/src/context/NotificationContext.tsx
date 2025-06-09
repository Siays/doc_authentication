import { createContext, useContext, useEffect, useRef, useState } from "react";
import axiosClient from "../services/axiosClient";
import { useAuth } from "../hooks/useAuth";

export type Notification = {
  notification_id: string;
  message: string;
  created_at: string;
  has_read?: boolean;
};

type NotificationContextType = {
  notifications: Notification[];
  hasUnread: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const sortByNewest = (list: Notification[]) =>
    [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  
    

  useEffect(() => {
    if (!user?.id) {
      console.log("WebSocket skipped: user not loaded yet");
      return;
    }
  
    const wsUrl = `${import.meta.env.VITE_WEBSOCKET_URL}/ws/${user.id}`;
    console.log("Connecting WebSocket to", wsUrl);
  
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
  
    ws.onopen = () => {
      console.log("WebSocket connected for user", user.id);
    };
  
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!data.notification_id || !data.created_at) {
          console.warn("Skipping invalid notification", data);
          return;
        }
    
        setNotifications((prev) => sortByNewest([data, ...prev]));

      } catch (err) {
        console.error("WebSocket error:", err);
      }
    };
    
    
  
    ws.onclose = () => console.log("WebSocket closed");
  
    return () => {
      ws.close();
      console.log("WebSocket disconnected");
    };
  }, [user?.id]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;
      try {
        const res = await axiosClient.get(`/notifications/${user.id}`);
        const sorted = sortByNewest(res.data); // use the updated helper here
        setNotifications(sorted);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    
    fetchNotifications();
  }, [user?.id]);  

  useEffect(() => {
    setHasUnread(notifications.some((n) => !n.has_read));
  }, [notifications]);

  const markAsRead = async (id: string) => {
    try {
      await axiosClient.post(`/notifications/${id}/read`, null, {
        params: { account_id: user?.id },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.notification_id === id ? { ...n, has_read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosClient.post(`/notifications/${user?.id}/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, has_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, hasUnread, markAsRead, markAllAsRead, setNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within NotificationProvider");
  return context;
};
