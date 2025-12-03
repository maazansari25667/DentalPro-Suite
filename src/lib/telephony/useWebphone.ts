/**
 * React hook for webphone operations
 * Provides high-level telephony functionality with provider abstraction
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useTelephonyStore } from './state';
import { MockWebphoneProvider } from './mock-provider';
import { 
  WebphoneProvider, 
  WebphoneEvent, 
  CallState, 
  CallDirection, 
  RegistrationState,
  CallDisposition,
  RegistrationError,
  CallError,
  DeviceError 
} from './provider-adapter';

export interface UseWebphoneOptions {
  autoRegister?: boolean;
  provider?: WebphoneProvider;
  config?: {
    token?: string;
    sip?: { uri: string; ws: string };
    iceServers?: RTCIceServer[];
  };
}

export interface WebphoneActions {
  // Registration
  register: () => Promise<void>;
  unregister: () => Promise<void>;
  
  // Call management
  dial: (target: string, options?: { 
    patientId?: string; 
    appointmentId?: string; 
    dentistId?: string;
    fromDisplay?: string;
  }) => Promise<string>;
  answer: (callId: string) => Promise<void>;
  hangup: (callId: string, disposition?: CallDisposition) => Promise<void>;
  hold: (callId: string, on: boolean) => Promise<void>;
  transfer: (callId: string, target: string, warm?: boolean) => Promise<void>;
  sendDTMF: (callId: string, digits: string) => Promise<void>;
  
  // Device management
  getDevices: () => Promise<{ input: MediaDeviceInfo[]; output: MediaDeviceInfo[] }>;
  setDevices: (devices: { inputId?: string; outputId?: string }) => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  
  // Utility
  redial: () => Promise<string | undefined>;
  isRegistered: () => boolean;
  canCall: () => boolean;
  canAnswer: (callId: string) => boolean;
  canHold: (callId: string) => boolean;
  canTransfer: (callId: string) => boolean;
  
  // Analytics
  logEvent: (event: string, data?: Record<string, any>) => void;
}

export interface WebphoneState {
  isInitialized: boolean;
  isRegistering: boolean;
  isRegistered: boolean;
  registrationError?: string;
  hasPermissions: boolean;
  permissionsError?: string;
  activeCall?: any;
  calls: any[];
}

let providerInstance: WebphoneProvider | null = null;
let initializationPromise: Promise<void> | null = null;

export function useWebphone(options: UseWebphoneOptions = {}): [WebphoneState, WebphoneActions] {
  const {
    autoRegister = true,
    provider,
    config = {}
  } = options;

  // Zustand store
  const store = useTelephonyStore();
  
  // Local state
  const [isInitialized, setIsInitialized] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string>();
  const cleanupRef = useRef<(() => void) | null>(null);
  const providerRef = useRef<WebphoneProvider | null>(null);

  // Initialize provider (singleton pattern)
  const initializeProvider = useCallback(async (): Promise<WebphoneProvider> => {
    if (providerInstance && providerRef.current) {
      return providerRef.current;
    }

    if (initializationPromise) {
      await initializationPromise;
      return providerRef.current!;
    }

    initializationPromise = (async () => {
      try {
        const newProvider = provider || new MockWebphoneProvider();
        
        // Initialize the provider
        await newProvider.init(config);
        
        // Set up event listeners
        const unsubscribe = newProvider.on(handleProviderEvent);
        
        providerInstance = newProvider;
        providerRef.current = newProvider;
        cleanupRef.current = () => {
          unsubscribe();
          providerInstance = null;
          providerRef.current = null;
        };
        
        console.log('Webphone provider initialized successfully');
        setIsInitialized(true);
        
        // Auto-register if enabled
        if (autoRegister) {
          setTimeout(() => {
            register();
          }, 100);
        }
        
      } catch (error) {
        console.error('Failed to initialize webphone provider:', error);
        store.setRegistration(RegistrationState.ERROR, 
          error instanceof Error ? error.message : 'Initialization failed');
        throw error;
      }
    })();

    await initializationPromise;
    return providerRef.current!;
  }, [provider, config, autoRegister, store]);

  // Handle provider events
  const handleProviderEvent = useCallback((event: WebphoneEvent) => {
    console.log('Webphone event received:', event);
    
    logEvent('webphone_event', { eventType: event.type, ...event });

    switch (event.type) {
      case 'registered':
        store.setRegistration(RegistrationState.REGISTERED);
        break;
        
      case 'unregistered':
        store.setRegistration(RegistrationState.UNREGISTERED);
        break;
        
      case 'registration_error':
        store.setRegistration(RegistrationState.ERROR, event.error);
        break;
        
      case 'incoming':
        store.upsertCall({
          id: event.callId,
          peer: event.from,
          peerDisplay: event.fromDisplay,
          direction: CallDirection.INBOUND,
          state: CallState.RINGING_IN,
          startedAt: event.timestamp
        });
        store.showIncomingCall(event.callId);
        break;
        
      case 'ringing':
        store.updateCall(event.callId, { 
          state: CallState.RINGING_OUT 
        });
        break;
        
      case 'connected':
        store.updateCall(event.callId, { 
          state: CallState.IN_CALL,
          answeredAt: event.timestamp
        });
        store.setActiveCall(event.callId);
        break;
        
      case 'ended':
        const call = store.getCallById(event.callId);
        if (call) {
          store.endCall(event.callId, event.reason);
        }
        if (store.activeCallId === event.callId) {
          store.setActiveCall(undefined);
        }
        store.hideIncomingCall();
        break;
        
      case 'held':
        store.updateCall(event.callId, { 
          isHeld: event.isHeld,
          state: event.isHeld ? CallState.ON_HOLD : CallState.IN_CALL
        });
        break;
        
      case 'remoteStream':
        // Attach stream to audio element
        const audioElement = document.getElementById('remoteAudio') as HTMLAudioElement;
        if (audioElement) {
          audioElement.srcObject = event.stream;
          audioElement.play().catch(console.error);
        }
        break;
        
      case 'error':
        console.error('Webphone error:', event.error);
        if (event.callId) {
          store.updateCall(event.callId, { state: CallState.ERROR });
        }
        break;
    }
  }, [store]);

  // Actions
  const register = useCallback(async (): Promise<void> => {
    try {
      store.setRegistration(RegistrationState.REGISTERING);
      const provider = await initializeProvider();
      await provider.register();
      logEvent('register_attempt', { success: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      store.setRegistration(RegistrationState.ERROR, errorMessage);
      logEvent('register_attempt', { success: false, error: errorMessage });
      throw error;
    }
  }, [initializeProvider, store]);

  const unregister = useCallback(async (): Promise<void> => {
    try {
      const provider = await initializeProvider();
      await provider.unregister();
      logEvent('unregister');
    } catch (error) {
      console.error('Failed to unregister:', error);
      throw error;
    }
  }, [initializeProvider]);

  const dial = useCallback(async (
    target: string, 
    options: { 
      patientId?: string; 
      appointmentId?: string; 
      dentistId?: string;
      fromDisplay?: string;
    } = {}
  ): Promise<string> => {
    try {
      // Auto-register if not registered
      if (store.registration !== RegistrationState.REGISTERED) {
        await register();
      }

      const provider = await initializeProvider();
      const callId = await provider.call(target, { fromDisplay: options.fromDisplay });
      
      // Create call record
      store.upsertCall({
        id: callId,
        peer: target,
        direction: CallDirection.OUTBOUND,
        state: CallState.DIALING,
        startedAt: new Date().toISOString(),
        patientId: options.patientId,
        appointmentId: options.appointmentId,
        dentistId: options.dentistId
      });
      
      store.setLastDialedNumber(target);
      
      logEvent('dial_attempt', { 
        target, 
        patientId: options.patientId,
        appointmentId: options.appointmentId,
        dentistId: options.dentistId
      });
      
      return callId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Dial failed';
      logEvent('dial_attempt', { target, success: false, error: errorMessage });
      throw error;
    }
  }, [store, register, initializeProvider]);

  const answer = useCallback(async (callId: string): Promise<void> => {
    try {
      const provider = await initializeProvider();
      await provider.answer(callId);
      store.hideIncomingCall();
      logEvent('answer_call', { callId });
    } catch (error) {
      console.error('Failed to answer call:', error);
      logEvent('answer_call', { callId, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }, [initializeProvider, store]);

  const hangup = useCallback(async (callId: string, disposition?: CallDisposition): Promise<void> => {
    try {
      const provider = await initializeProvider();
      await provider.hangup(callId);
      
      if (disposition) {
        store.updateCall(callId, { disposition });
      }
      
      logEvent('hangup_call', { callId, disposition });
    } catch (error) {
      console.error('Failed to hangup call:', error);
      throw error;
    }
  }, [initializeProvider, store]);

  const hold = useCallback(async (callId: string, on: boolean): Promise<void> => {
    try {
      const provider = await initializeProvider();
      await provider.hold(callId, on);
      logEvent('hold_call', { callId, hold: on });
    } catch (error) {
      console.error('Failed to hold/unhold call:', error);
      throw error;
    }
  }, [initializeProvider]);

  const transfer = useCallback(async (callId: string, target: string, warm = false): Promise<void> => {
    try {
      const provider = await initializeProvider();
      await provider.transfer(callId, target, warm);
      logEvent('transfer_call', { callId, target, warm });
    } catch (error) {
      console.error('Failed to transfer call:', error);
      throw error;
    }
  }, [initializeProvider]);

  const sendDTMF = useCallback(async (callId: string, digits: string): Promise<void> => {
    try {
      const provider = await initializeProvider();
      await provider.sendDTMF(callId, digits);
      logEvent('send_dtmf', { callId, digits });
    } catch (error) {
      console.error('Failed to send DTMF:', error);
      throw error;
    }
  }, [initializeProvider]);

  const getDevices = useCallback(async () => {
    try {
      const provider = await initializeProvider();
      const devices = await provider.getDevices();
      store.setAvailableDevices(devices);
      return devices;
    } catch (error) {
      console.error('Failed to get devices:', error);
      throw error;
    }
  }, [initializeProvider, store]);

  const setDevices = useCallback(async (devices: { inputId?: string; outputId?: string }) => {
    try {
      const provider = await initializeProvider();
      await provider.setDevices(devices);
      store.updateDeviceSettings(devices);
      logEvent('set_devices', devices);
    } catch (error) {
      console.error('Failed to set devices:', error);
      throw error;
    }
  }, [initializeProvider, store]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      setPermissionsError(undefined);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Clean up the stream
      stream.getTracks().forEach(track => track.stop());
      
      store.setPermissions({ microphone: 'granted' });
      logEvent('permissions_granted', { microphone: true });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Permission denied';
      setPermissionsError(errorMessage);
      store.setPermissions({ microphone: 'denied' });
      logEvent('permissions_denied', { microphone: true, error: errorMessage });
      
      return false;
    }
  }, [store]);

  const redial = useCallback(async (): Promise<string | undefined> => {
    const lastNumber = store.ui.lastDialedNumber;
    if (!lastNumber) {
      throw new Error('No number to redial');
    }
    
    return dial(lastNumber);
  }, [store.ui.lastDialedNumber, dial]);

  // Utility functions
  const isRegistered = useCallback((): boolean => {
    return store.registration === RegistrationState.REGISTERED;
  }, [store.registration]);

  const canCall = useCallback((): boolean => {
    return isRegistered() && store.permissions.microphone === 'granted';
  }, [isRegistered, store.permissions.microphone]);

  const canAnswer = useCallback((callId: string): boolean => {
    const call = store.getCallById(callId);
    return call?.state === CallState.RINGING_IN && isRegistered();
  }, [store, isRegistered]);

  const canHold = useCallback((callId: string): boolean => {
    const call = store.getCallById(callId);
    return (call?.state === CallState.IN_CALL || call?.state === CallState.ON_HOLD) && isRegistered();
  }, [store, isRegistered]);

  const canTransfer = useCallback((callId: string): boolean => {
    const call = store.getCallById(callId);
    return call?.state === CallState.IN_CALL && isRegistered();
  }, [store, isRegistered]);

  // Analytics logging
  const logEvent = useCallback((event: string, data: Record<string, any> = {}) => {
    const eventData = {
      event,
      timestamp: new Date().toISOString(),
      sessionId: `session_${Date.now()}`,
      ...data
    };
    
    // Store in localStorage for front-end analytics
    const events = JSON.parse(localStorage.getItem('webphone_analytics') || '[]');
    events.push(eventData);
    
    // Keep only last 1000 events
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }
    
    localStorage.setItem('webphone_analytics', JSON.stringify(events));
    
    // Console table for debugging
    console.table([eventData]);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeProvider().catch(console.error);
    
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [initializeProvider]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (providerRef.current) {
        providerRef.current.destroy().catch(console.error);
      }
    };
  }, []);

  const state: WebphoneState = {
    isInitialized,
    isRegistering: store.registration === RegistrationState.REGISTERING,
    isRegistered: store.registration === RegistrationState.REGISTERED,
    registrationError: store.registrationError,
    hasPermissions: store.permissions.microphone === 'granted',
    permissionsError,
    activeCall: store.getActiveCall(),
    calls: Object.values(store.calls)
  };

  const actions: WebphoneActions = {
    register,
    unregister,
    dial,
    answer,
    hangup,
    hold,
    transfer,
    sendDTMF,
    getDevices,
    setDevices,
    requestPermissions,
    redial,
    isRegistered,
    canCall,
    canAnswer,
    canHold,
    canTransfer,
    logEvent
  };

  return [state, actions];
}