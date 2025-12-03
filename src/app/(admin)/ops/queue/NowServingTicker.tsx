'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Bell, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

import { useNowServing, useCreateNowServing } from '@/lib/hooks/useNowServing';
import Button from '@/components/ui/button/Button';

interface NowServingTickerProps {
  soundEnabled: boolean;
}

export function NowServingTicker({ soundEnabled }: NowServingTickerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { data: recentEvents = [] } = useNowServing();
  const createNowServingMutation = useCreateNowServing();

  // Auto-hide ticker when no recent events
  useEffect(() => {
    setIsVisible(recentEvents.length > 0);
  }, [recentEvents]);

  // Play sound notification when new event is added
  useEffect(() => {
    if (recentEvents.length > 0 && soundEnabled) {
      const latestEvent = recentEvents[0];
      const eventTime = new Date(latestEvent.calledAt);
      const now = new Date();
      
      // If event was created in the last 5 seconds, play sound
      if (now.getTime() - eventTime.getTime() < 5000) {
        playNotificationSound();
      }
    }
  }, [recentEvents, soundEnabled]);

  const playNotificationSound = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Now serving');
      utterance.volume = 0.3;
      utterance.rate = 1.2;
      speechSynthesis.speak(utterance);
    }
    
    // Also play a notification beep
    if ('Audio' in window) {
      try {
        // Create a simple beep sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.log('Audio not supported');
      }
    }
  };

  const handleCallNext = async (ticketId: string) => {
    try {
      await createNowServingMutation.mutateAsync({
        ticketId,
        displayDuration: 30, // 30 seconds
        soundAlert: soundEnabled,
        displayMessage: 'Please proceed to your assigned room',
      });

      toast.success('Patient called successfully');
    } catch (error) {
      console.error('Failed to call patient:', error);
      toast.error('Failed to call patient');
    }
  };

  if (!isVisible) {
    return (
      <div className="bg-blue-900 text-white p-2 text-center">
        <p className="text-sm">Ready to serve patients</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-900 text-white shadow-lg border-t">
      {/* Main Ticker Area */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-300" />
            <span className="font-semibold">Now Serving</span>
          </div>

          {/* Recent Events Scrolling Display */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center space-x-6 animate-pulse">
              {recentEvents.slice(0, 3).map((event: any, index: number) => (
                <div key={event.id} className="flex items-center space-x-3 min-w-max">
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      #{event.ticketNumber}
                    </span>
                    <ArrowRight className="h-4 w-4 text-blue-300" />
                    <div>
                      <span className="font-medium">
                        {event.patient.firstName} {event.patient.lastName}
                      </span>
                      {event.room && (
                        <span className="ml-2 text-blue-200 text-sm">
                          → {event.room.name}
                        </span>
                      )}
                      {event.dentist && (
                        <span className="ml-2 text-blue-200 text-sm">
                          → Dr. {event.dentist.lastName}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {index < recentEvents.slice(0, 3).length - 1 && (
                    <div className="h-6 border-l border-blue-600 ml-4"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          <span className="text-xs text-blue-200">
            {new Date().toLocaleTimeString()}
          </span>
          
          {/* Sound Toggle (visual only - controlled by parent) */}
          <div className="flex items-center">
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-blue-300" />
            ) : (
              <VolumeX className="h-4 w-4 text-blue-300" />
            )}
          </div>
          
          {/* Minimize Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="text-blue-200 hover:text-white transition-colors"
            title="Minimize ticker"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Event Details */}
      {recentEvents.length > 0 && (
        <div className="bg-blue-800 px-6 py-3 border-t border-blue-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-100">
              Latest: {recentEvents[0].displayMessage || 'Patient called to room'}
              <span className="ml-2 text-blue-300">
                • {new Date(recentEvents[0].calledAt).toLocaleTimeString()}
              </span>
            </div>
            
            {/* Quick Call Next Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // This would need to be connected to queue data to find next patient
                toast('Call Next functionality - connect to queue system');
              }}
              className="bg-blue-600 border-blue-500 text-white hover:bg-blue-500"
            >
              Call Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}