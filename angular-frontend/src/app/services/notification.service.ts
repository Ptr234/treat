import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
  timestamp: Date;
  isRead: boolean;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly maxNotifications = 50;
  private notificationCounter = 0;

  private notificationSubject = new BehaviorSubject<NotificationState>({
    notifications: [],
    unreadCount: 0
  });

  public notifications$ = this.notificationSubject.asObservable();

  get currentNotifications(): Notification[] {
    return this.notificationSubject.value.notifications;
  }

  get unreadCount(): number {
    return this.notificationSubject.value.unreadCount;
  }

  success(title: string, message: string, duration = 5000): string {
    return this.addNotification({
      type: 'success',
      title,
      message,
      duration
    });
  }

  error(title: string, message: string, duration = 10000): string {
    return this.addNotification({
      type: 'error',
      title,
      message,
      duration
    });
  }

  warning(title: string, message: string, duration = 7000): string {
    return this.addNotification({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  info(title: string, message: string, duration = 5000): string {
    return this.addNotification({
      type: 'info',
      title,
      message,
      duration
    });
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): string {
    const id = this.generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      isRead: false
    };

    const currentState = this.notificationSubject.value;
    let updatedNotifications = [newNotification, ...currentState.notifications];

    // Limit the number of notifications
    if (updatedNotifications.length > this.maxNotifications) {
      updatedNotifications = updatedNotifications.slice(0, this.maxNotifications);
    }

    const unreadCount = updatedNotifications.filter(n => !n.isRead).length;

    this.notificationSubject.next({
      notifications: updatedNotifications,
      unreadCount
    });

    // Auto-remove notification if duration is specified
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, notification.duration);
    }

    return id;
  }

  removeNotification(id: string): void {
    const currentState = this.notificationSubject.value;
    const updatedNotifications = currentState.notifications.filter(n => n.id !== id);
    const unreadCount = updatedNotifications.filter(n => !n.isRead).length;

    this.notificationSubject.next({
      notifications: updatedNotifications,
      unreadCount
    });
  }

  markAsRead(id: string): void {
    const currentState = this.notificationSubject.value;
    const updatedNotifications = currentState.notifications.map(notification => 
      notification.id === id 
        ? { ...notification, isRead: true }
        : notification
    );
    const unreadCount = updatedNotifications.filter(n => !n.isRead).length;

    this.notificationSubject.next({
      notifications: updatedNotifications,
      unreadCount
    });
  }

  markAllAsRead(): void {
    const currentState = this.notificationSubject.value;
    const updatedNotifications = currentState.notifications.map(notification => ({
      ...notification,
      isRead: true
    }));

    this.notificationSubject.next({
      notifications: updatedNotifications,
      unreadCount: 0
    });
  }

  clearAll(): void {
    this.notificationSubject.next({
      notifications: [],
      unreadCount: 0
    });
  }

  getNotificationsByType(type: Notification['type']): Observable<Notification[]> {
    return this.notifications$.pipe(
      map(state => state.notifications.filter(n => n.type === type)),
      filter(notifications => notifications.length > 0)
    );
  }

  private generateId(): string {
    return `notification-${++this.notificationCounter}-${Date.now()}`;
  }
}