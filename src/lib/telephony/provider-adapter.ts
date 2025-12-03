/**
 * Vendor-agnostic WebRTC/SIP telephony provider interface
 * Supports pluggable backends (SIP.js, Twilio, Vonage, etc.)
 */

export interface WebphoneProvider {
  /**
   * Initialize the provider with configuration
   */
  init(opts: {
    token?: string;
    sip?: { uri: string; ws: string };
    iceServers?: RTCIceServer[];
  }): Promise<void>;

  /**
   * Register with the telephony service
   */
  register(): Promise<void>;

  /**
   * Unregister from the telephony service
   */
  unregister(): Promise<void>;

  /**
   * Initiate an outbound call
   * @param target Phone number or extension
   * @param opts Call options
   * @returns Call ID for tracking
   */
  call(target: string, opts?: { fromDisplay?: string }): Promise<string>;

  /**
   * Answer an incoming call
   * @param callId Call identifier
   */
  answer(callId: string): Promise<void>;

  /**
   * Hang up a call
   * @param callId Call identifier
   */
  hangup(callId: string): Promise<void>;

  /**
   * Hold or unhold a call
   * @param callId Call identifier
   * @param on True to hold, false to unhold
   */
  hold(callId: string, on: boolean): Promise<void>;

  /**
   * Transfer a call to another number
   * @param callId Call identifier
   * @param target Transfer destination
   * @param warm Whether to do a warm transfer (consultation)
   */
  transfer(callId: string, target: string, warm?: boolean): Promise<void>;

  /**
   * Send DTMF tones during a call
   * @param callId Call identifier
   * @param digits DTMF digits to send
   */
  sendDTMF(callId: string, digits: string): Promise<void>;

  /**
   * Set audio input and output devices
   * @param dev Device configuration
   */
  setDevices(dev: { inputId?: string; outputId?: string }): Promise<void>;

  /**
   * Subscribe to telephony events
   * @param cb Event callback
   * @returns Unsubscribe function
   */
  on(cb: (e: WebphoneEvent) => void): () => void;

  /**
   * Get available audio devices
   */
  getDevices(): Promise<{
    input: MediaDeviceInfo[];
    output: MediaDeviceInfo[];
  }>;

  /**
   * Get current registration status
   */
  getStatus(): {
    registered: boolean;
    connecting: boolean;
    error?: string;
  };

  /**
   * Clean up resources
   */
  destroy(): Promise<void>;
}

/**
 * Telephony events emitted by the provider
 */
export type WebphoneEvent =
  | { type: "registered"; timestamp: string }
  | { type: "unregistered"; timestamp: string }
  | { type: "registration_error"; error: string; timestamp: string }
  | { type: "incoming"; callId: string; from: string; fromDisplay?: string; timestamp: string }
  | { type: "ringing"; callId: string; timestamp: string }
  | { type: "connected"; callId: string; timestamp: string }
  | { type: "ended"; callId: string; reason?: string; timestamp: string }
  | { type: "error"; callId?: string; error: string; timestamp: string }
  | { type: "remoteStream"; callId: string; stream: MediaStream; timestamp: string }
  | { type: "held"; callId: string; isHeld: boolean; timestamp: string }
  | { type: "transfer_initiated"; callId: string; target: string; timestamp: string }
  | { type: "transfer_completed"; callId: string; timestamp: string }
  | { type: "dtmf_sent"; callId: string; digits: string; timestamp: string };

/**
 * Call direction enumeration
 */
export enum CallDirection {
  INBOUND = "inbound",
  OUTBOUND = "outbound"
}

/**
 * Call states following telephony state machine
 */
export enum CallState {
  IDLE = "idle",
  DIALING = "dialing",
  RINGING_IN = "ringing_in", 
  RINGING_OUT = "ringing_out",
  CONNECTING = "connecting",
  IN_CALL = "in_call",
  ON_HOLD = "on_hold",
  TRANSFERRING = "transferring",
  ENDED = "ended",
  ERROR = "error"
}

/**
 * Registration states
 */
export enum RegistrationState {
  UNREGISTERED = "unregistered",
  REGISTERING = "registering", 
  REGISTERED = "registered",
  ERROR = "error"
}

/**
 * Call disposition for logging
 */
export enum CallDisposition {
  REACHED = "reached",
  LEFT_VM = "left_vm",
  NO_ANSWER = "no_answer", 
  BUSY = "busy",
  WRONG_NUMBER = "wrong_number",
  DECLINED = "declined",
  OTHER = "other"
}

/**
 * Provider factory type for dependency injection
 */
export type ProviderFactory = () => WebphoneProvider;

/**
 * Configuration for different provider types
 */
export interface ProviderConfig {
  type: "mock" | "sip" | "twilio" | "vonage";
  config: Record<string, any>;
}

/**
 * Error types for better error handling
 */
export class TelephonyError extends Error {
  constructor(
    message: string,
    public code: string,
    public callId?: string
  ) {
    super(message);
    this.name = "TelephonyError";
  }
}

export class RegistrationError extends TelephonyError {
  constructor(message: string, code: string = "REGISTRATION_FAILED") {
    super(message, code);
    this.name = "RegistrationError";
  }
}

export class CallError extends TelephonyError {
  constructor(message: string, code: string, callId?: string) {
    super(message, code, callId);
    this.name = "CallError";
  }
}

export class DeviceError extends TelephonyError {
  constructor(message: string, code: string = "DEVICE_ERROR") {
    super(message, code);
    this.name = "DeviceError";
  }
}