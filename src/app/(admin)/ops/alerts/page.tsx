'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/button/Button';
import { 
  AlertTriangle, 
  Clock, 
  Bell, 
  X, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  User,
  Calendar,
  Megaphone
} from 'lucide-react';
import { useNowServing } from '@/lib/hooks/useNowServing';
import { format, parseISO } from 'date-fns';

interface Alert {
  id: string;
  type: 'now-serving' | 'sla-breach' | 'no-show' | 'system';
  title: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data?: Record<string, any>;
  acknowledged?: boolean;
  dismissed?: boolean;
}

type AlertFilter = 'all' | 'now-serving' | 'sla-breach' | 'no-show' | 'system';

const ALERT_COLORS = {
  'now-serving': 'bg-blue-50 border-blue-200 text-blue-800',
  'sla-breach': 'bg-red-50 border-red-200 text-red-800',
  'no-show': 'bg-yellow-50 border-yellow-200 text-yellow-800',
  'system': 'bg-gray-50 border-gray-200 text-gray-800',
};

const ALERT_ICONS = {
  'now-serving': Megaphone,
  'sla-breach': AlertTriangle,
  'no-show': XCircle,
  'system': Bell,
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<AlertFilter>('all');
  const [showDismissed, setShowDismissed] = useState(false);

  const { data: nowServingEvents } = useNowServing();

  // Load alerts from localStorage on mount
  useEffect(() => {
    const storedAlerts = localStorage.getItem('dental-alerts');
    if (storedAlerts) {
      try {
        const parsed = JSON.parse(storedAlerts);
        setAlerts(parsed);
      } catch (error) {
        console.error('Failed to parse stored alerts:', error);
      }
    }
  }, []);

  // Save alerts to localStorage whenever alerts change
  useEffect(() => {
    localStorage.setItem('dental-alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Generate alerts from NowServing events
  useEffect(() => {
    if (nowServingEvents) {
      const newAlerts = nowServingEvents
        .filter(event => !alerts.some(alert => alert.id === event.id))
        .map(event => ({
          id: event.id,
          type: 'now-serving' as const,
          title: 'Patient Now Serving',
          message: `${event.patient.firstName} ${event.patient.lastName} called to ${event.room.name} with ${event.dentist.firstName} ${event.dentist.lastName}`,
          timestamp: event.calledAt,
          severity: 'medium' as const,
          data: {
            ticketNumber: event.ticketNumber,
            patientName: `${event.patient.firstName} ${event.patient.lastName}`,
            roomName: event.room.name,
            dentistName: `${event.dentist.firstName} ${event.dentist.lastName}`,
          },
        }));

      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev]);
      }
    }
  }, [nowServingEvents, alerts]);

  // Simulate SLA breach alerts (would come from real monitoring in production)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate occasional SLA breach
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const breachAlert: Alert = {
          id: `sla-breach-${Date.now()}`,
          type: 'sla-breach',
          title: 'SLA Breach Alert',
          message: `Emergency patient has been waiting over 15 minutes (Ticket #${Math.floor(Math.random() * 1000)})`,
          timestamp: new Date().toISOString(),
          severity: 'critical',
          data: {
            ticketNumber: `T${Math.floor(Math.random() * 1000)}`,
            waitTime: '18 minutes',
            priority: 'emergency',
          },
        };

        setAlerts(prev => [breachAlert, ...prev]);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Simulate no-show alerts
  const generateNoShowAlert = () => {
    const noShowAlert: Alert = {
      id: `no-show-${Date.now()}`,
      type: 'no-show',
      title: 'Patient No-Show',
      message: `John Smith failed to show for 2:30 PM appointment`,
      timestamp: new Date().toISOString(),
      severity: 'medium',
      data: {
        patientName: 'John Smith',
        appointmentTime: '2:30 PM',
        procedure: 'Routine Cleaning',
      },
    };

    setAlerts(prev => [noShowAlert, ...prev]);
  };

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (!showDismissed && alert.dismissed) return false;
    if (filter === 'all') return true;
    return alert.type === filter;
  });

  // Group alerts by date
  const groupedAlerts = filteredAlerts.reduce((groups, alert) => {
    const date = format(parseISO(alert.timestamp), 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(alert);
    return groups;
  }, {} as Record<string, Alert[]>);

  // Alert actions
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
  };

  const clearAllAlerts = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, dismissed: true })));
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertCounts = () => {
    const counts = {
      all: alerts.filter(a => !a.dismissed).length,
      'now-serving': alerts.filter(a => a.type === 'now-serving' && !a.dismissed).length,
      'sla-breach': alerts.filter(a => a.type === 'sla-breach' && !a.dismissed).length,
      'no-show': alerts.filter(a => a.type === 'no-show' && !a.dismissed).length,
      'system': alerts.filter(a => a.type === 'system' && !a.dismissed).length,
    };
    return counts;
  };

  const counts = getAlertCounts();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alerts Center</h1>
          <p className="text-gray-600 mt-1">Monitor system events, SLA breaches, and patient notifications</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Test Buttons */}
          <Button
            onClick={generateNoShowAlert}
            variant="outline"
            className="text-sm"
          >
            Test No-Show Alert
          </Button>

          <Button
            onClick={clearAllAlerts}
            variant="outline"
            className="text-sm text-red-600 border-red-300 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { key: 'all' as const, label: 'All', icon: Bell },
          { key: 'now-serving' as const, label: 'Now Serving', icon: Megaphone },
          { key: 'sla-breach' as const, label: 'SLA Breaches', icon: AlertTriangle },
          { key: 'no-show' as const, label: 'No Shows', icon: XCircle },
          { key: 'system' as const, label: 'System', icon: Bell },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              filter === key 
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            {counts[key] > 0 && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                filter === key 
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Show Dismissed Toggle */}
      <div className="mb-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showDismissed}
            onChange={(e) => setShowDismissed(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">Show dismissed alerts</span>
        </label>
      </div>

      {/* Alerts List */}
      <div className="space-y-6">
        {Object.keys(groupedAlerts).length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts</h3>
            <p className="text-gray-600">All clear! No alerts to display.</p>
          </div>
        ) : (
          Object.entries(groupedAlerts)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, dayAlerts]) => (
              <div key={date}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {format(parseISO(date), 'MMMM d, yyyy')}
                </h3>

                <div className="space-y-3">
                  {dayAlerts
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map(alert => {
                      const AlertIcon = ALERT_ICONS[alert.type];
                      
                      return (
                        <div
                          key={alert.id}
                          className={`p-4 rounded-lg border-2 ${ALERT_COLORS[alert.type]} ${
                            alert.dismissed ? 'opacity-60' : ''
                          } ${alert.acknowledged ? 'ring-2 ring-green-200' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <AlertIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                                alert.severity === 'critical' ? 'animate-pulse' : ''
                              }`} />
                              
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-semibold">{alert.title}</h4>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                                    alert.severity === 'critical' 
                                      ? 'bg-red-200 text-red-800'
                                      : alert.severity === 'high'
                                      ? 'bg-orange-200 text-orange-800'
                                      : alert.severity === 'medium'
                                      ? 'bg-yellow-200 text-yellow-800'
                                      : 'bg-gray-200 text-gray-800'
                                  }`}>
                                    {alert.severity}
                                  </span>
                                  {alert.acknowledged && (
                                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-200 text-green-800">
                                      Acknowledged
                                    </span>
                                  )}
                                </div>
                                
                                <p className="text-sm mb-2">{alert.message}</p>
                                
                                <p className="text-xs opacity-75">
                                  {format(parseISO(alert.timestamp), 'h:mm a')}
                                </p>

                                {/* Alert Data */}
                                {alert.data && (
                                  <div className="mt-2 text-xs space-y-1">
                                    {Object.entries(alert.data).map(([key, value]) => (
                                      <div key={key} className="flex items-center space-x-2">
                                        <span className="font-medium capitalize">
                                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                                        </span>
                                        <span>{value}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Alert Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              {!alert.acknowledged && (
                                <Button
                                  onClick={() => acknowledgeAlert(alert.id)}
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-300 hover:bg-green-50"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {!alert.dismissed && (
                                <Button
                                  onClick={() => dismissAlert(alert.id)}
                                  size="sm"
                                  variant="outline"
                                  className="text-gray-600 border-gray-300 hover:bg-gray-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}

                              <Button
                                onClick={() => deleteAlert(alert.id)}
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}