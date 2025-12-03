'use client';

import React from 'react';
import Button from '@/components/ui/button/Button';
import { 
  Users, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Search,
  Plus,
  RefreshCw,
  FileX,
  Wifi,
  Database
} from 'lucide-react';

interface EmptyStateProps {
  type: 'no-data' | 'no-results' | 'error' | 'loading' | 'offline' | 'empty-queue' | 'empty-appointments';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'outline';
  };
  className?: string;
}

const EMPTY_STATE_ICONS = {
  'no-data': FileX,
  'no-results': Search,
  'error': AlertTriangle,
  'loading': RefreshCw,
  'offline': Wifi,
  'empty-queue': Clock,
  'empty-appointments': Calendar,
};

export function EmptyState({
  type,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  const Icon = EMPTY_STATE_ICONS[type] || FileX;

  const getIconColor = () => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'loading':
        return 'text-blue-400';
      case 'offline':
        return 'text-orange-400';
      default:
        return 'text-gray-400 dark:text-gray-500';
    }
  };

  const getIconAnimation = () => {
    return type === 'loading' ? 'animate-spin' : '';
  };

  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      <div className="max-w-sm mx-auto">
        <Icon className={`h-16 w-16 mx-auto mb-4 ${getIconColor()} ${getIconAnimation()}`} />
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          {description}
        </p>

        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'primary'}
            className="inline-flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{action.label}</span>
          </Button>
        )}
      </div>
    </div>
  );
}

// Specific empty state components for common use cases
export function EmptyQueue({ onCreateCheckIn }: { onCreateCheckIn?: () => void }) {
  return (
    <EmptyState
      type="empty-queue"
      title="No patients in queue"
      description="The queue is empty. Create a new check-in to get started."
      action={onCreateCheckIn ? {
        label: 'Create Check-in',
        onClick: onCreateCheckIn
      } : undefined}
    />
  );
}

export function EmptyAppointments({ onCreateAppointment }: { onCreateAppointment?: () => void }) {
  return (
    <EmptyState
      type="empty-appointments"
      title="No appointments scheduled"
      description="No appointments found for the selected date. Schedule a new appointment to get started."
      action={onCreateAppointment ? {
        label: 'Schedule Appointment',
        onClick: onCreateAppointment
      } : undefined}
    />
  );
}

export function NoSearchResults({ query, onClear }: { query: string; onClear?: () => void }) {
  return (
    <EmptyState
      type="no-results"
      title={`No results for "${query}"`}
      description="Try adjusting your search criteria or browse all items."
      action={onClear ? {
        label: 'Clear Search',
        onClick: onClear,
        variant: 'outline'
      } : undefined}
    />
  );
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <EmptyState
      type="loading"
      title={message}
      description="Please wait while we fetch your data."
    />
  );
}

export function ErrorState({ 
  title = 'Something went wrong',
  message = 'There was an error loading the data. Please try again.',
  onRetry 
}: { 
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      type="error"
      title={title}
      description={message}
      action={onRetry ? {
        label: 'Try Again',
        onClick: onRetry,
        variant: 'outline'
      } : undefined}
    />
  );
}

export function OfflineState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      type="offline"
      title="You're offline"
      description="Check your internet connection and try again."
      action={onRetry ? {
        label: 'Retry',
        onClick: onRetry,
        variant: 'outline'
      } : undefined}
    />
  );
}