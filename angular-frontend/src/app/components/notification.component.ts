import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService, Notification } from '../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <div 
        *ngFor="let notification of notifications; trackBy: trackByNotificationId"
        class="transform transition-all duration-300 ease-in-out"
        [class]="getNotificationClasses(notification)"
      >
        <div class="p-4 rounded-lg shadow-lg border-l-4" [class]="getNotificationStyles(notification)">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg 
                class="h-5 w-5" 
                [class]="getIconClasses(notification.type)"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <!-- Success Icon -->
                <path 
                  *ngIf="notification.type === 'success'"
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <!-- Error Icon -->
                <path 
                  *ngIf="notification.type === 'error'"
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <!-- Warning Icon -->
                <path 
                  *ngIf="notification.type === 'warning'"
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
                <!-- Info Icon -->
                <path 
                  *ngIf="notification.type === 'info'"
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm font-medium" [class]="getTitleClasses(notification.type)">
                {{ notification.title }}
              </p>
              <p class="mt-1 text-sm" [class]="getMessageClasses(notification.type)">
                {{ notification.message }}
              </p>
              <div *ngIf="notification.action" class="mt-2">
                <button
                  (click)="executeAction(notification)"
                  class="text-sm font-medium underline hover:no-underline"
                  [class]="getActionClasses(notification.type)"
                >
                  {{ notification.action.label }}
                </button>
              </div>
            </div>
            <div class="ml-4 flex-shrink-0">
              <button
                (click)="removeNotification(notification.id)"
                class="inline-flex rounded-md p-1.5 transition-colors duration-200"
                [class]="getCloseButtonClasses(notification.type)"
              >
                <span class="sr-only">Dismiss</span>
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-enter {
      opacity: 0;
      transform: translateX(100%);
    }
    
    .notification-leave {
      opacity: 0;
      transform: translateX(100%);
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.notifications = state.notifications.slice(0, 5); // Show max 5 notifications
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }

  executeAction(notification: Notification): void {
    if (notification.action) {
      notification.action.handler();
      this.notificationService.removeNotification(notification.id);
    }
  }

  getNotificationClasses(notification: Notification): string {
    return `notification-item animate-slide-in-right`;
  }

  getNotificationStyles(notification: Notification): string {
    const baseClasses = 'bg-white border-gray-200';
    const typeClasses = {
      success: 'border-l-green-500 bg-green-50',
      error: 'border-l-red-500 bg-red-50', 
      warning: 'border-l-yellow-500 bg-yellow-50',
      info: 'border-l-blue-500 bg-blue-50'
    };
    
    return `${baseClasses} ${typeClasses[notification.type]}`;
  }

  getIconClasses(type: Notification['type']): string {
    const classes = {
      success: 'text-green-400',
      error: 'text-red-400',
      warning: 'text-yellow-400',
      info: 'text-blue-400'
    };
    
    return classes[type];
  }

  getTitleClasses(type: Notification['type']): string {
    const classes = {
      success: 'text-green-800',
      error: 'text-red-800',
      warning: 'text-yellow-800',
      info: 'text-blue-800'
    };
    
    return classes[type];
  }

  getMessageClasses(type: Notification['type']): string {
    const classes = {
      success: 'text-green-700',
      error: 'text-red-700',
      warning: 'text-yellow-700',
      info: 'text-blue-700'
    };
    
    return classes[type];
  }

  getActionClasses(type: Notification['type']): string {
    const classes = {
      success: 'text-green-600 hover:text-green-500',
      error: 'text-red-600 hover:text-red-500',
      warning: 'text-yellow-600 hover:text-yellow-500',
      info: 'text-blue-600 hover:text-blue-500'
    };
    
    return classes[type];
  }

  getCloseButtonClasses(type: Notification['type']): string {
    const classes = {
      success: 'text-green-400 hover:text-green-600 hover:bg-green-100',
      error: 'text-red-400 hover:text-red-600 hover:bg-red-100',
      warning: 'text-yellow-400 hover:text-yellow-600 hover:bg-yellow-100',
      info: 'text-blue-400 hover:text-blue-600 hover:bg-blue-100'
    };
    
    return classes[type];
  }
}