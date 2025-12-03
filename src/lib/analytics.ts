import { format } from 'date-fns';

export interface AnalyticsEvent {
  id: string;
  timestamp: string;
  type: string;
  action: string;
  data: Record<string, any>;
  sessionId: string;
  userId?: string;
}

type EventType = 
  | 'check-in-create'
  | 'ticket-move'
  | 'status-change'
  | 'now-serving'
  | 'sla-breach'
  | 'user-action'
  | 'system-event';

class AnalyticsService {
  private sessionId: string;
  private events: AnalyticsEvent[] = [];
  private maxEvents = 1000; // Limit stored events
  private storageKey = 'dental-analytics-events';

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadStoredEvents();
    
    // Set up periodic console table logging
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.displayRecentEvents();
      }, 30000); // Every 30 seconds
    }
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadStoredEvents(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load analytics events:', error);
    }
  }

  private saveEvents(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Keep only the most recent events
      const eventsToStore = this.events.slice(-this.maxEvents);
      localStorage.setItem(this.storageKey, JSON.stringify(eventsToStore));
    } catch (error) {
      console.error('Failed to save analytics events:', error);
    }
  }

  public track(type: EventType, action: string, data: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      action,
      data: {
        ...data,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      },
      sessionId: this.sessionId,
      userId: data.userId || 'anonymous',
    };

    this.events.push(event);
    this.saveEvents();

    // Console log for immediate feedback
    console.log(`📊 Analytics: ${type}/${action}`, data);
  }

  public getEvents(filter?: {
    type?: EventType;
    action?: string;
    since?: Date;
    limit?: number;
  }): AnalyticsEvent[] {
    let filtered = [...this.events];

    if (filter?.type) {
      filtered = filtered.filter(e => e.type === filter.type);
    }

    if (filter?.action) {
      filtered = filtered.filter(e => e.action === filter.action);
    }

    if (filter?.since) {
      filtered = filtered.filter(e => new Date(e.timestamp) >= filter.since!);
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getEventSummary(timeframe: 'hour' | 'day' | 'week' = 'day'): Record<string, number> {
    const since = new Date();
    switch (timeframe) {
      case 'hour':
        since.setHours(since.getHours() - 1);
        break;
      case 'day':
        since.setDate(since.getDate() - 1);
        break;
      case 'week':
        since.setDate(since.getDate() - 7);
        break;
    }

    const recentEvents = this.getEvents({ since });
    const summary: Record<string, number> = {};

    recentEvents.forEach(event => {
      const key = `${event.type}/${event.action}`;
      summary[key] = (summary[key] || 0) + 1;
    });

    return summary;
  }

  public displayRecentEvents(limit = 10): void {
    if (typeof console === 'undefined') return;

    const recent = this.getEvents({ limit });
    if (recent.length === 0) {
      console.log('📊 No recent analytics events');
      return;
    }

    const tableData = recent.map(event => ({
      Time: format(new Date(event.timestamp), 'HH:mm:ss'),
      Type: event.type,
      Action: event.action,
      Data: JSON.stringify(event.data),
      Session: event.sessionId.split('-')[1], // Shortened session ID
    }));

    console.log(`📊 Recent Analytics Events (${recent.length})`);
    console.table(tableData);
  }

  public exportEvents(): string {
    return JSON.stringify(this.events, null, 2);
  }

  public clearEvents(): void {
    this.events = [];
    this.saveEvents();
    console.log('📊 Analytics events cleared');
  }

  // Specific tracking methods for common events
  public trackCheckInCreate(data: { patientId: string; method: 'reception' | 'kiosk'; visitType: string }): void {
    this.track('check-in-create', 'create', data);
  }

  public trackTicketMove(data: { ticketId: string; fromLane: string; toLane: string; position?: number }): void {
    this.track('ticket-move', 'drag-drop', data);
  }

  public trackStatusChange(data: { ticketId: string; fromStatus: string; toStatus: string; reason?: string }): void {
    this.track('status-change', 'update', data);
  }

  public trackNowServing(data: { ticketId: string; patientName: string; roomName: string; dentistName: string }): void {
    this.track('now-serving', 'call-patient', data);
  }

  public trackSLABreach(data: { ticketId: string; priority: string; waitTime: number; threshold: number }): void {
    this.track('sla-breach', 'threshold-exceeded', data);
  }

  public trackUserAction(action: string, data: Record<string, any> = {}): void {
    this.track('user-action', action, data);
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

// Export hook for React components
export function useEvent() {
  return {
    track: analyticsService.track.bind(analyticsService),
    trackCheckInCreate: analyticsService.trackCheckInCreate.bind(analyticsService),
    trackTicketMove: analyticsService.trackTicketMove.bind(analyticsService),
    trackStatusChange: analyticsService.trackStatusChange.bind(analyticsService),
    trackNowServing: analyticsService.trackNowServing.bind(analyticsService),
    trackSLABreach: analyticsService.trackSLABreach.bind(analyticsService),
    trackUserAction: analyticsService.trackUserAction.bind(analyticsService),
    getEvents: analyticsService.getEvents.bind(analyticsService),
    getEventSummary: analyticsService.getEventSummary.bind(analyticsService),
    displayRecentEvents: analyticsService.displayRecentEvents.bind(analyticsService),
    exportEvents: analyticsService.exportEvents.bind(analyticsService),
    clearEvents: analyticsService.clearEvents.bind(analyticsService),
  };
}

// Export service instance for direct usage
export { analyticsService };

// Auto-track page views
if (typeof window !== 'undefined') {
  // Track initial page load
  analyticsService.track('system-event', 'page-load', {
    path: window.location.pathname,
    referrer: document.referrer,
  });

  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    analyticsService.track('system-event', document.hidden ? 'page-hidden' : 'page-visible', {
      path: window.location.pathname,
    });
  });

  // Track before page unload
  window.addEventListener('beforeunload', () => {
    analyticsService.track('system-event', 'page-unload', {
      path: window.location.pathname,
    });
  });
}