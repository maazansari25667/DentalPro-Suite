/**
 * Zustand store for telephony state management
 * Handles registration status, active calls, and device selection
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RegistrationState, CallState, CallDirection, CallDisposition } from './provider-adapter';

export type RegState = RegistrationState;
export type CallStateType = CallState;

export interface Call {
  id: string;
  peer: string;                 // E.164 or extension
  peerDisplay?: string;         // Display name for the peer
  direction: CallDirection;
  state: CallStateType;
  startedAt?: string;           // ISO timestamp
  answeredAt?: string;          // ISO timestamp when answered
  endedAt?: string;             // ISO timestamp when ended
  duration?: number;            // seconds
  notes?: string;               // Call notes
  disposition?: CallDisposition; // Call outcome
  patientId?: string;           // Related patient ID
  appointmentId?: string;       // Related appointment ID
  dentistId?: string;           // Related dentist ID
  ticketId?: string;            // Related queue ticket ID
  isHeld?: boolean;             // Whether call is on hold
  isMuted?: boolean;            // Whether microphone is muted
  recordings?: string[];        // Recording file URLs/IDs
}

export interface CallStats {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  averageCallDuration: number;
  totalCallTime: number;
}

export interface DeviceSettings {
  inputId?: string;
  outputId?: string;
  ringtoneVolume: number;       // 0-1
  microphoneGain: number;       // 0-1
  speakerVolume: number;        // 0-1
  autoAnswer?: boolean;         // Auto-answer after X rings
  autoAnswerRings?: number;     // Number of rings before auto-answer
}

export interface TelephonySettings {
  devices: DeviceSettings;
  ui: {
    dockPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    dockMinimized: boolean;
    showCallToasts: boolean;
    showCallHistory: boolean;
    darkMode?: boolean;
  };
  call: {
    recordCalls: boolean;
    showCallTimer: boolean;
    enableDTMF: boolean;
    enableTransfer: boolean;
    enableHold: boolean;
    defaultDialingPrefix?: string;
  };
}

export interface TelephonyStore {
  // Registration state
  registration: RegState;
  registrationError?: string;
  
  // Active calls
  activeCallId?: string;
  calls: Record<string, Call>;
  
  // Call history (persisted)
  callHistory: Call[];
  
  // Device management
  availableDevices: {
    input: MediaDeviceInfo[];
    output: MediaDeviceInfo[];
  };
  
  // Settings (persisted)
  settings: TelephonySettings;
  
  // UI state
  ui: {
    dockExpanded: boolean;
    showIncomingCallToast: boolean;
    incomingCallId?: string;
    dialerValue: string;
    lastDialedNumber?: string;
  };
  
  // Statistics
  stats: CallStats;
  
  // Permissions
  permissions: {
    microphone: 'granted' | 'denied' | 'prompt' | 'unknown';
    camera: 'granted' | 'denied' | 'prompt' | 'unknown';
  };

  // Actions
  setRegistration: (state: RegState, error?: string) => void;
  
  // Call management
  setActiveCall: (callId?: string) => void;
  upsertCall: (call: Call) => void;
  updateCall: (callId: string, updates: Partial<Call>) => void;
  endCall: (callId: string, reason?: string, disposition?: CallDisposition) => void;
  addToHistory: (call: Call) => void;
  clearHistory: () => void;
  
  // Device management
  setAvailableDevices: (devices: { input: MediaDeviceInfo[]; output: MediaDeviceInfo[] }) => void;
  updateDeviceSettings: (settings: Partial<DeviceSettings>) => void;
  
  // Settings
  updateSettings: (settings: Partial<TelephonySettings>) => void;
  
  // UI management
  setDockExpanded: (expanded: boolean) => void;
  showIncomingCall: (callId: string) => void;
  hideIncomingCall: () => void;
  setDialerValue: (value: string) => void;
  setLastDialedNumber: (number: string) => void;
  
  // Statistics
  updateStats: () => void;
  
  // Permissions
  setPermissions: (permissions: Partial<TelephonyStore['permissions']>) => void;
  
  // Utility methods
  getCallById: (callId: string) => Call | undefined;
  getActiveCall: () => Call | undefined;
  getCallsByDate: (date: string) => Call[];
  getCallsByPatient: (patientId: string) => Call[];
  getCallsByDentist: (dentistId: string) => Call[];
  getTodaysCalls: () => Call[];
  getCallDuration: (call: Call) => number;
  formatCallDuration: (seconds: number) => string;
}

const defaultSettings: TelephonySettings = {
  devices: {
    ringtoneVolume: 0.8,
    microphoneGain: 0.8,
    speakerVolume: 0.8,
    autoAnswer: false,
    autoAnswerRings: 3,
  },
  ui: {
    dockPosition: 'bottom-right',
    dockMinimized: false,
    showCallToasts: true,
    showCallHistory: true,
  },
  call: {
    recordCalls: false,
    showCallTimer: true,
    enableDTMF: true,
    enableTransfer: true,
    enableHold: true,
  },
};

const defaultStats: CallStats = {
  totalCalls: 0,
  answeredCalls: 0,
  missedCalls: 0,
  averageCallDuration: 0,
  totalCallTime: 0,
};

export const useTelephonyStore = create<TelephonyStore>()(
  persist(
    (set, get) => ({
      // Initial state
      registration: RegistrationState.UNREGISTERED,
      calls: {},
      callHistory: [],
      availableDevices: { input: [], output: [] },
      settings: defaultSettings,
      ui: {
        dockExpanded: false,
        showIncomingCallToast: false,
        dialerValue: '',
      },
      stats: defaultStats,
      permissions: {
        microphone: 'unknown',
        camera: 'unknown',
      },

      // Registration actions
      setRegistration: (state, error) => 
        set({ registration: state, registrationError: error }),

      // Call management
      setActiveCall: (callId) => 
        set({ activeCallId: callId }),

      upsertCall: (call) =>
        set((state) => ({
          calls: { ...state.calls, [call.id]: call }
        })),

      updateCall: (callId, updates) =>
        set((state) => {
          const existingCall = state.calls[callId];
          if (!existingCall) return state;
          
          return {
            calls: {
              ...state.calls,
              [callId]: { ...existingCall, ...updates }
            }
          };
        }),

      endCall: (callId, reason, disposition) =>
        set((state) => {
          const call = state.calls[callId];
          if (!call) return state;

          const endedCall: Call = {
            ...call,
            state: CallState.ENDED,
            endedAt: new Date().toISOString(),
            disposition: disposition || call.disposition,
            duration: call.answeredAt ? 
              Math.round((new Date().getTime() - new Date(call.answeredAt).getTime()) / 1000) :
              0
          };

          // Add to history
          const updatedHistory = [endedCall, ...state.callHistory.slice(0, 99)]; // Keep last 100 calls

          const updatedCalls = { ...state.calls };
          delete updatedCalls[callId];

          return {
            calls: updatedCalls,
            callHistory: updatedHistory,
            activeCallId: state.activeCallId === callId ? undefined : state.activeCallId
          };
        }),

      addToHistory: (call) =>
        set((state) => ({
          callHistory: [call, ...state.callHistory.slice(0, 99)]
        })),

      clearHistory: () =>
        set({ callHistory: [] }),

      // Device management
      setAvailableDevices: (devices) =>
        set({ availableDevices: devices }),

      updateDeviceSettings: (deviceSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            devices: { ...state.settings.devices, ...deviceSettings }
          }
        })),

      // Settings
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        })),

      // UI management
      setDockExpanded: (expanded) =>
        set((state) => ({
          ui: { ...state.ui, dockExpanded: expanded }
        })),

      showIncomingCall: (callId) =>
        set((state) => ({
          ui: { 
            ...state.ui, 
            showIncomingCallToast: true, 
            incomingCallId: callId 
          }
        })),

      hideIncomingCall: () =>
        set((state) => ({
          ui: { 
            ...state.ui, 
            showIncomingCallToast: false, 
            incomingCallId: undefined 
          }
        })),

      setDialerValue: (value) =>
        set((state) => ({
          ui: { ...state.ui, dialerValue: value }
        })),

      setLastDialedNumber: (number) =>
        set((state) => ({
          ui: { ...state.ui, lastDialedNumber: number }
        })),

      // Statistics
      updateStats: () =>
        set((state) => {
          const calls = state.callHistory;
          const answeredCalls = calls.filter(c => c.answeredAt);
          const totalCallTime = calls.reduce((sum, call) => sum + (call.duration || 0), 0);
          
          return {
            stats: {
              totalCalls: calls.length,
              answeredCalls: answeredCalls.length,
              missedCalls: calls.length - answeredCalls.length,
              averageCallDuration: answeredCalls.length > 0 ? 
                totalCallTime / answeredCalls.length : 0,
              totalCallTime
            }
          };
        }),

      // Permissions
      setPermissions: (permissions) =>
        set((state) => ({
          permissions: { ...state.permissions, ...permissions }
        })),

      // Utility methods
      getCallById: (callId) => {
        const state = get();
        return state.calls[callId] || state.callHistory.find(c => c.id === callId);
      },

      getActiveCall: () => {
        const state = get();
        return state.activeCallId ? state.calls[state.activeCallId] : undefined;
      },

      getCallsByDate: (date) => {
        const state = get();
        return state.callHistory.filter(call => 
          call.startedAt?.startsWith(date)
        );
      },

      getCallsByPatient: (patientId) => {
        const state = get();
        return state.callHistory.filter(call => call.patientId === patientId);
      },

      getCallsByDentist: (dentistId) => {
        const state = get();
        return state.callHistory.filter(call => call.dentistId === dentistId);
      },

      getTodaysCalls: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        return state.getCallsByDate(today);
      },

      getCallDuration: (call) => {
        if (call.duration) return call.duration;
        if (!call.answeredAt) return 0;
        
        const endTime = call.endedAt ? new Date(call.endedAt) : new Date();
        const startTime = new Date(call.answeredAt);
        
        return Math.round((endTime.getTime() - startTime.getTime()) / 1000);
      },

      formatCallDuration: (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
          return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
      },
    }),
    {
      name: 'telephony-storage',
      partialize: (state) => ({
        callHistory: state.callHistory,
        settings: state.settings,
        permissions: state.permissions,
      }),
    }
  )
);