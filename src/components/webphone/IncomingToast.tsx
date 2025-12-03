/**
 * Incoming call toast notification component
 * Shows accept/reject options for inbound calls
 */

"use client";

import { useEffect, useState } from 'react';
import { Phone, PhoneOff, User, Clock } from 'lucide-react';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { useTelephonyStore } from '@/lib/telephony/state';
import { useWebphone } from '@/lib/telephony/useWebphone';
import { CallDisposition, CallState } from '@/lib/telephony/provider-adapter';

interface IncomingToastProps {
  className?: string;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  autoHideDelay?: number;
}

function cn(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function IncomingToast({ 
  className, 
  position = 'top-right',
  autoHideDelay = 30000 // 30 seconds
}: IncomingToastProps) {
  const [, actions] = useWebphone();
  const store = useTelephonyStore();
  const [timeLeft, setTimeLeft] = useState(autoHideDelay / 1000);
  
  const incomingCallId = store.ui.incomingCallId;
  const incomingCall = incomingCallId ? store.getCallById(incomingCallId) : undefined;
  const isVisible = store.ui.showIncomingCallToast && incomingCall?.state === CallState.RINGING_IN;

  // Countdown timer
  useEffect(() => {
    if (!isVisible) {
      setTimeLeft(autoHideDelay / 1000);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-decline when timer expires
          if (incomingCall?.id) {
            handleDecline();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, autoHideDelay, incomingCall?.id]);

  const handleAccept = async () => {
    if (!incomingCall?.id) return;
    
    try {
      await actions.answer(incomingCall.id);
      actions.logEvent('incoming_call_accepted', { 
        callId: incomingCall.id,
        from: incomingCall.peer 
      });
    } catch (error) {
      console.error('Failed to answer incoming call:', error);
    }
  };

  const handleDecline = async () => {
    if (!incomingCall?.id) return;
    
    try {
      await actions.hangup(incomingCall.id, CallDisposition.DECLINED);
      actions.logEvent('incoming_call_declined', { 
        callId: incomingCall.id,
        from: incomingCall.peer 
      });
    } catch (error) {
      console.error('Failed to decline incoming call:', error);
    }
  };

  const getPositionClasses = () => {
    const base = "fixed z-50";
    
    switch (position) {
      case 'top-center':
        return `${base} top-4 left-1/2 -translate-x-1/2`;
      case 'top-left':
        return `${base} top-4 left-4`;
      case 'bottom-right':
        return `${base} bottom-4 right-4`;
      case 'bottom-center':
        return `${base} bottom-4 left-1/2 -translate-x-1/2`;
      case 'bottom-left':
        return `${base} bottom-4 left-4`;
      default: // top-right
        return `${base} top-4 right-4`;
    }
  };

  const formatPhoneNumber = (number: string): string => {
    // Basic formatting for display
    if (number.startsWith('+1')) {
      const cleaned = number.slice(2);
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
    }
    return number;
  };

  const getCallerInfo = () => {
    if (!incomingCall) return null;

    // In a real app, you would look up the caller in your contacts/patients database
    const displayName = incomingCall.peerDisplay || 'Unknown Caller';
    const displayNumber = formatPhoneNumber(incomingCall.peer);
    
    return {
      name: displayName,
      number: displayNumber,
      avatar: undefined, // Could be fetched from patient records
      isKnownContact: !!incomingCall.peerDisplay
    };
  };

  if (!isVisible || !incomingCall) {
    return null;
  }

  const callerInfo = getCallerInfo();
  if (!callerInfo) return null;

  return (
    <div className={cn(getPositionClasses(), className)}>
      <div className="w-80 bg-blue-50 dark:bg-blue-900 border-2 border-blue-200 dark:border-blue-700 rounded-lg shadow-xl backdrop-blur-sm p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <Badge color="primary" size="sm">
            Incoming Call
          </Badge>
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Caller Information */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {callerInfo.isKnownContact ? (
              <span className="text-lg font-semibold">
                {callerInfo.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="h-5 w-5 text-gray-500" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {callerInfo.name}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {callerInfo.number}
            </div>
            {callerInfo.isKnownContact && (
              <div className="mt-1">
                <Badge color="success" size="sm">
                  Known Contact
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleDecline}
            className="flex-1 bg-red-600 text-white hover:bg-red-700"
            size="sm"
          >
            <PhoneOff className="h-4 w-4 mr-2" />
            Decline
          </Button>
          
          <Button
            onClick={handleAccept}
            className="flex-1 bg-green-600 text-white hover:bg-green-700"
            size="sm"
          >
            <Phone className="h-4 w-4 mr-2" />
            Answer
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={() => {
              // Send to voicemail
              handleDecline();
              actions.logEvent('incoming_call_sent_to_vm', { 
                callId: incomingCall.id,
                from: incomingCall.peer 
              });
            }}
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Send to Voicemail
          </button>
          
          {callerInfo.isKnownContact && (
            <button
              onClick={() => {
                // Open patient record
                actions.logEvent('incoming_call_view_contact', { 
                  callId: incomingCall.id,
                  from: incomingCall.peer 
                });
              }}
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              View Contact
            </button>
          )}
        </div>
      </div>
    </div>
  );
}