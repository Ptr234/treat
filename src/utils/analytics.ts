export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

export interface UserProperties {
  userId?: string;
  email?: string;
  userType?: 'investor' | 'entrepreneur' | 'government' | 'visitor';
  location?: string;
  registrationDate?: string;
  [key: string]: unknown;
}

export interface PageViewEvent {
  page: string;
  title?: string;
  referrer?: string;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, unknown>;
}

class Analytics {
  private isInitialized = false;
  private sessionId: string;
  private userId?: string;
  private queue: AnalyticsEvent[] = [];
  private isOnline = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupOnlineDetection();
    this.processQueuedEvents();
  }

  /**
   * Initialize analytics with user information
   */
  public init(userId?: string): void {
    this.userId = userId;
    this.isInitialized = true;
    
    // Process any queued events
    this.processQueuedEvents();
    
    console.log('Analytics initialized', { userId, sessionId: this.sessionId });
  }

  /**
   * Track a custom event
   */
  public track(eventName: string, properties?: Record<string, unknown>): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        page: typeof window !== 'undefined' ? window.location.pathname : undefined,
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined
      },
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId
    };

    this.sendEvent(event);
  }

  /**
   * Track page view
   */
  public trackPageView(page?: string, properties?: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;

    const pageViewEvent: PageViewEvent = {
      page: page || window.location.pathname,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      properties: {
        ...properties,
        url: window.location.href,
        search: window.location.search,
        hash: window.location.hash
      }
    };

    this.track('page_view', pageViewEvent as unknown as Record<string, unknown>);
  }

  /**
   * Track user interaction events
   */
  public trackClick(element: string, properties?: Record<string, unknown>): void {
    this.track('click', {
      element,
      ...properties
    });
  }

  public trackFormSubmit(formName: string, properties?: Record<string, unknown>): void {
    this.track('form_submit', {
      form: formName,
      ...properties
    });
  }

  public trackSearch(query: string, results?: number, properties?: Record<string, unknown>): void {
    this.track('search', {
      query,
      results,
      ...properties
    });
  }

  public trackDownload(fileName: string, fileType?: string, properties?: Record<string, unknown>): void {
    this.track('download', {
      fileName,
      fileType,
      ...properties
    });
  }

  /**
   * Track business-specific events for Uganda Investment Portal
   */
  public trackInvestmentView(investmentId: string, sector: string, properties?: Record<string, unknown>): void {
    this.track('investment_view', {
      investmentId,
      sector,
      ...properties
    });
  }

  public trackInvestmentApplication(investmentId: string, sector: string, properties?: Record<string, unknown>): void {
    this.track('investment_application', {
      investmentId,
      sector,
      ...properties
    });
  }

  public trackServiceRequest(serviceName: string, agency: string, properties?: Record<string, unknown>): void {
    this.track('service_request', {
      serviceName,
      agency,
      ...properties
    });
  }

  public trackBusinessRegistration(step: string, businessType?: string, properties?: Record<string, unknown>): void {
    this.track('business_registration', {
      step,
      businessType,
      ...properties
    });
  }

  public trackCalculatorUse(calculatorType: 'tax' | 'roi' | 'invoice', properties?: Record<string, unknown>): void {
    this.track('calculator_use', {
      calculatorType,
      ...properties
    });
  }

  /**
   * Set user properties
   */
  public setUserProperties(properties: UserProperties): void {
    if (properties.userId) {
      this.userId = properties.userId;
    }

    this.track('user_properties_set', properties);
  }

  /**
   * Track timing events
   */
  public trackTiming(category: string, variable: string, value: number, label?: string): void {
    this.track('timing', {
      category,
      variable,
      value,
      label
    });
  }

  /**
   * Track errors
   */
  public trackError(error: string, category?: string, properties?: Record<string, unknown>): void {
    this.track('error', {
      error,
      category,
      ...properties
    });
  }

  /**
   * Track performance metrics
   */
  public trackPerformance(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.track('performance', {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        responseTime: navigation.responseEnd - navigation.requestStart,
        renderTime: navigation.loadEventEnd - navigation.responseEnd
      });
    }
  }

  /**
   * Send event to analytics service
   */
  private sendEvent(event: AnalyticsEvent): void {
    if (!this.isOnline) {
      this.queueEvent(event);
      return;
    }

    // In development, just log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
      return;
    }

    // In production, send to your analytics service
    // Examples: Google Analytics 4, Mixpanel, Amplitude, etc.
    this.sendToAnalyticsService(event);
  }

  /**
   * Send to actual analytics service (placeholder)
   */
  private async sendToAnalyticsService(event: AnalyticsEvent): Promise<void> {
    try {
      // Example: Send to Google Analytics 4
      if (typeof window !== 'undefined' && (window as unknown as { gtag?: (command: string, eventName: string, parameters: Record<string, unknown>) => void }).gtag) {
        (window as unknown as { gtag: (command: string, eventName: string, parameters: Record<string, unknown>) => void }).gtag('event', event.name, {
          ...event.properties,
          custom_parameter_user_id: event.userId,
          custom_parameter_session_id: event.sessionId
        });
      }

      // Example: Send to custom analytics endpoint
      /*
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });
      */

    } catch (error) {
      console.warn('Failed to send analytics event:', error);
      this.queueEvent(event);
    }
  }

  /**
   * Queue event for later sending when online
   */
  private queueEvent(event: AnalyticsEvent): void {
    this.queue.push(event);
    
    // Persist to localStorage
    try {
      const existingQueue = localStorage.getItem('analytics_queue');
      const queue = existingQueue ? JSON.parse(existingQueue) : [];
      queue.push(event);
      
      // Keep only last 100 events
      if (queue.length > 100) {
        queue.splice(0, queue.length - 100);
      }
      
      localStorage.setItem('analytics_queue', JSON.stringify(queue));
    } catch (error) {
      console.warn('Failed to queue analytics event:', error);
    }
  }

  /**
   * Process queued events when coming back online
   */
  private processQueuedEvents(): void {
    if (!this.isOnline) return;

    // Process in-memory queue
    const queueCopy = [...this.queue];
    this.queue = [];
    
    queueCopy.forEach(event => {
      this.sendToAnalyticsService(event);
    });

    // Process localStorage queue
    try {
      const queuedEvents = localStorage.getItem('analytics_queue');
      if (queuedEvents) {
        const events = JSON.parse(queuedEvents);
        events.forEach((event: AnalyticsEvent) => {
          this.sendToAnalyticsService(event);
        });
        localStorage.removeItem('analytics_queue');
      }
    } catch (error) {
      console.warn('Failed to process queued analytics events:', error);
    }
  }

  /**
   * Setup online/offline detection
   */
  private setupOnlineDetection(): void {
    if (typeof window === 'undefined') return;

    this.isOnline = navigator.onLine;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueuedEvents();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get analytics data for debugging
   */
  public getDebugInfo(): object {
    return {
      isInitialized: this.isInitialized,
      sessionId: this.sessionId,
      userId: this.userId,
      queueLength: this.queue.length,
      isOnline: this.isOnline
    };
  }
}

// Create singleton instance
const analytics = new Analytics();

export default analytics;

// Export convenience functions
export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => 
  analytics.track(eventName, properties);

export const trackPageView = (page?: string, properties?: Record<string, unknown>) => 
  analytics.trackPageView(page, properties);

export const trackClick = (element: string, properties?: Record<string, unknown>) => 
  analytics.trackClick(element, properties);

export const initAnalytics = (userId?: string) => 
  analytics.init(userId);

export { analytics };