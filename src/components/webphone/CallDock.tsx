/**
 * Persistent call dock component - floating UI for webphone controls
 * Appears at bottom-right and persists across all app routes
 */

"use client";

import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, VolumeX, Pause, Play, Settings, Users } from 'lucide-react';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { cn } from '@/lib/utils';
import { useWebphone } from '@/lib/telephony/useWebphone';
import { useTelephonyStore } from '@/lib/telephony/state';
import { CallState, RegistrationState, CallDisposition } from '@/lib/telephony/provider-adapter';
import { Dialer } from './Dialer';

interface CallDockProps {
  className?: string;
}

export function CallDock({ className }: CallDockProps) {
  const [state, actions] = useWebphone();
  const store = useTelephonyStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const activeCall = state.activeCall;
  const hasActiveCalls = state.calls.length > 0;
  const isRegistered = state.isRegistered;

  // Call timer effect
  useEffect(() => {
    if (activeCall?.state === CallState.IN_CALL && activeCall.answeredAt) {
      const startTime = new Date(activeCall.answeredAt).getTime();
      
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setCallTimer(elapsed);
      }, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    } else {
      setCallTimer(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [activeCall?.state, activeCall?.answeredAt]);

  // Auto-expand when there's an active call
  useEffect(() => {
    if (activeCall && !isMinimized) {
      setIsExpanded(true);
    }
  }, [activeCall, isMinimized]);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsExpanded(false);
  };

  const handleDial = async (number: string) => {
    try {
      await actions.dial(number);
      store.setDialerValue('');
    } catch (error) {
      console.error('Failed to dial:', error);
    }
  };

  const handleAnswer = async () => {
    if (activeCall?.id) {
      try {
        await actions.answer(activeCall.id);
      } catch (error) {
        console.error('Failed to answer call:', error);
      }
    }
  };

  const handleHangup = async (disposition?: CallDisposition) => {
    if (activeCall?.id) {
      try {
        await actions.hangup(activeCall.id, disposition);
        setIsExpanded(false);
      } catch (error) {
        console.error('Failed to hangup call:', error);
      }
    }
  };

  const handleHold = async () => {
    if (activeCall?.id && actions.canHold(activeCall.id)) {
      try {
        await actions.hold(activeCall.id, !activeCall.isHeld);
      } catch (error) {
        console.error('Failed to toggle hold:', error);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    actions.logEvent('toggle_mute', { muted: !isMuted });
  };

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRegistrationBadge = () => {
    switch (store.registration) {
      case RegistrationState.REGISTERED:
        return <Badge color="success" size="sm">Online</Badge>;
      case RegistrationState.REGISTERING:
        return <Badge color="warning" size="sm">Connecting...</Badge>;
      case RegistrationState.ERROR:
        return <Badge color="error" size="sm">Offline</Badge>;
      default:
        return <Badge color="light" size="sm">Disconnected</Badge>;
    }
  };

  const getCallStatusDisplay = () => {
    if (!activeCall) return null;

    const peerDisplay = activeCall.peerDisplay || activeCall.peer;
    
    switch (activeCall.state) {
      case CallState.DIALING:
        return (
          <div className="text-center">
            <div className="text-sm font-medium">Calling...</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{peerDisplay}</div>
          </div>
        );
      case CallState.RINGING_IN:
        return (
          <div className="text-center">
            <div className="text-sm font-medium text-green-600">Incoming Call</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{peerDisplay}</div>
          </div>
        );
      case CallState.RINGING_OUT:
        return (
          <div className="text-center">
            <div className="text-sm font-medium">Ringing...</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{peerDisplay}</div>
          </div>
        );
      case CallState.IN_CALL:
        return (
          <div className="text-center">
            <div className="text-sm font-medium text-green-600">{formatTimer(callTimer)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{peerDisplay}</div>
            {activeCall.isHeld && <div className="text-xs text-yellow-600">On Hold</div>}
          </div>
        );
      case CallState.ON_HOLD:
        return (
          <div className="text-center">
            <div className="text-sm font-medium text-yellow-600">On Hold</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{peerDisplay}</div>
          </div>
        );
      default:
        return null;
    }
  };

  // Minimized view
  if (isMinimized) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <button
          onClick={handleToggleExpanded}
          className={cn(
            "relative h-12 w-12 rounded-full shadow-lg flex items-center justify-center",
            hasActiveCalls ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          )}
        >
          <Phone className="h-5 w-5" />
          {hasActiveCalls && (
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {state.calls.length}
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      <div className="w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span className="text-sm font-medium">Webphone</span>
            {getRegistrationBadge()}
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleMinimize}
              className="h-6 w-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ▼
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Call Status */}
        {activeCall && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {getCallStatusDisplay()}
          </div>
        )}

        {/* Expanded Controls */}
        {isExpanded && (
          <div className="space-y-3">
            {activeCall ? (
              // Active call controls
              <div className="space-y-3">
                {/* Call Actions */}
                <div className="flex justify-center gap-2">
                  {activeCall.state === CallState.RINGING_IN ? (
                    <div className="flex gap-2 w-full">
                      <Button
                        onClick={handleAnswer}
                        className="flex-1 bg-green-600 text-white hover:bg-green-700"
                        size="sm"
                      >
                        <PhoneCall className="h-4 w-4 mr-2" />
                        Answer
                      </Button>
                      <Button
                        onClick={() => handleHangup(CallDisposition.DECLINED)}
                        className="flex-1 bg-red-600 text-white hover:bg-red-700"
                        size="sm"
                      >
                        <PhoneOff className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <Button
                        onClick={toggleMute}
                        variant={isMuted ? "primary" : "outline"}
                        size="sm"
                        className="flex-1"
                      >
                        {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                      
                      {actions.canHold(activeCall.id) && (
                        <Button
                          onClick={handleHold}
                          variant={activeCall.isHeld ? "primary" : "outline"}
                          size="sm"
                          className="flex-1"
                        >
                          {activeCall.isHeld ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => handleHangup()}
                        className="flex-2 bg-red-600 text-white hover:bg-red-700"
                        size="sm"
                      >
                        <PhoneOff className="h-4 w-4 mr-2" />
                        End Call
                      </Button>
                    </div>
                  )}
                </div>

                {/* Transfer Controls */}
                {activeCall.state === CallState.IN_CALL && actions.canTransfer(activeCall.id) && (
                  <div className="border-t pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        actions.logEvent('transfer_requested', { callId: activeCall.id });
                      }}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Transfer Call
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              // Dialer when no active call
              <div className="space-y-3">
                <Dialer
                  value={store.ui.dialerValue}
                  onChange={store.setDialerValue}
                  onDial={handleDial}
                  disabled={!actions.canCall()}
                />
                
                {!isRegistered && (
                  <Button
                    onClick={actions.register}
                    className="w-full"
                    disabled={state.isRegistering}
                  >
                    {state.isRegistering ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>
            )}

            <hr className="border-gray-200 dark:border-gray-600" />

            {/* Quick Actions */}
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden audio elements for telephony */}
      <audio
        id="remoteAudio"
        ref={audioRef}
        autoPlay
        style={{ display: 'none' }}
      />
      <audio
        id="ringtone"
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIaBD2X2+/AbiMFl2+z9N17KQYhfsp+0IJ4LwUVaJ3szpFDBhmC3Y29ajEFOH/K79l+OAEPhv/3ckJPGBSc5Kp5mY4cVOH5WENZGxrP8Jt7bDIGNW/VmbtUXYkNl3q+qZ+JEhKk1P2yYEINT87o1Fpc"
        loop
        style={{ display: 'none' }}
      />
    </div>
  );
}