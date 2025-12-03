/**
 * Mock telephony provider for development and testing
 * Simulates WebRTC/SIP call flows without real backend
 */

import { 
  WebphoneProvider, 
  WebphoneEvent, 
  CallState, 
  RegistrationState,
  CallDirection,
  RegistrationError,
  CallError,
  DeviceError
} from './provider-adapter';

interface MockCall {
  id: string;
  peer: string;
  direction: CallDirection;
  state: CallState;
  startedAt: string;
  stream?: MediaStream;
}

export class MockWebphoneProvider implements WebphoneProvider {
  private registered = false;
  private connecting = false;
  private error?: string;
  private calls = new Map<string, MockCall>();
  private devices = { inputId: 'default', outputId: 'default' };
  private eventListeners: ((e: WebphoneEvent) => void)[] = [];
  private inboundCallTimer?: NodeJS.Timeout;
  private registrationTimer?: NodeJS.Timeout;

  async init(opts: {
    token?: string;
    sip?: { uri: string; ws: string };
    iceServers?: RTCIceServer[];
  }): Promise<void> {
    console.log('MockWebphoneProvider: Initializing with options', opts);
    
    // Simulate initialization delay
    await this.delay(500);
    
    // Start random inbound call generation
    this.startInboundCallSimulation();
    
    console.log('MockWebphoneProvider: Initialized successfully');
  }

  async register(): Promise<void> {
    if (this.registered) {
      console.log('MockWebphoneProvider: Already registered');
      return;
    }

    console.log('MockWebphoneProvider: Starting registration');
    this.connecting = true;
    this.error = undefined;

    try {
      // Simulate registration delay
      await this.delay(1000);

      // Randomly simulate registration failures for testing
      if (Math.random() < 0.1) {
        throw new RegistrationError('Simulated registration failure', 'NETWORK_ERROR');
      }

      this.registered = true;
      this.connecting = false;
      
      this.emit({
        type: 'registered',
        timestamp: new Date().toISOString()
      });

      console.log('MockWebphoneProvider: Registration successful');

    } catch (error) {
      this.connecting = false;
      this.error = error instanceof Error ? error.message : 'Unknown error';
      
      this.emit({
        type: 'registration_error',
        error: this.error,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  async unregister(): Promise<void> {
    if (!this.registered) {
      return;
    }

    console.log('MockWebphoneProvider: Unregistering');
    
    // End all active calls
    for (const call of this.calls.values()) {
      await this.hangup(call.id);
    }

    this.registered = false;
    this.connecting = false;
    this.error = undefined;

    this.emit({
      type: 'unregistered',
      timestamp: new Date().toISOString()
    });

    console.log('MockWebphoneProvider: Unregistered');
  }

  async call(target: string, opts?: { fromDisplay?: string }): Promise<string> {
    if (!this.registered) {
      throw new CallError('Not registered', 'NOT_REGISTERED');
    }

    const callId = this.generateCallId();
    const call: MockCall = {
      id: callId,
      peer: target,
      direction: CallDirection.OUTBOUND,
      state: CallState.DIALING,
      startedAt: new Date().toISOString()
    };

    this.calls.set(callId, call);

    console.log(`MockWebphoneProvider: Initiating call to ${target}`, { callId });

    // Simulate call progress
    this.simulateOutboundCall(callId);

    return callId;
  }

  async answer(callId: string): Promise<void> {
    const call = this.calls.get(callId);
    if (!call) {
      throw new CallError('Call not found', 'CALL_NOT_FOUND', callId);
    }

    if (call.state !== CallState.RINGING_IN) {
      throw new CallError('Call not in ringing state', 'INVALID_STATE', callId);
    }

    console.log(`MockWebphoneProvider: Answering call ${callId}`);

    call.state = CallState.CONNECTING;
    
    // Simulate connection delay
    setTimeout(() => {
      if (this.calls.has(callId)) {
        call.state = CallState.IN_CALL;
        
        // Create mock audio stream
        call.stream = this.createMockAudioStream();
        
        this.emit({
          type: 'connected',
          callId,
          timestamp: new Date().toISOString()
        });

        if (call.stream) {
          this.emit({
            type: 'remoteStream',
            callId,
            stream: call.stream,
            timestamp: new Date().toISOString()
          });
        }
      }
    }, 500);
  }

  async hangup(callId: string): Promise<void> {
    const call = this.calls.get(callId);
    if (!call) {
      throw new CallError('Call not found', 'CALL_NOT_FOUND', callId);
    }

    console.log(`MockWebphoneProvider: Hanging up call ${callId}`);

    call.state = CallState.ENDED;
    
    // Stop any audio streams
    if (call.stream) {
      call.stream.getTracks().forEach(track => track.stop());
    }

    this.emit({
      type: 'ended',
      callId,
      reason: 'user_hangup',
      timestamp: new Date().toISOString()
    });

    // Clean up call after a brief delay
    setTimeout(() => {
      this.calls.delete(callId);
    }, 1000);
  }

  async hold(callId: string, on: boolean): Promise<void> {
    const call = this.calls.get(callId);
    if (!call) {
      throw new CallError('Call not found', 'CALL_NOT_FOUND', callId);
    }

    if (call.state !== CallState.IN_CALL && call.state !== CallState.ON_HOLD) {
      throw new CallError('Call not in valid state for hold', 'INVALID_STATE', callId);
    }

    console.log(`MockWebphoneProvider: ${on ? 'Holding' : 'Unholding'} call ${callId}`);

    call.state = on ? CallState.ON_HOLD : CallState.IN_CALL;

    this.emit({
      type: 'held',
      callId,
      isHeld: on,
      timestamp: new Date().toISOString()
    });
  }

  async transfer(callId: string, target: string, warm?: boolean): Promise<void> {
    const call = this.calls.get(callId);
    if (!call) {
      throw new CallError('Call not found', 'CALL_NOT_FOUND', callId);
    }

    if (call.state !== CallState.IN_CALL) {
      throw new CallError('Call not in valid state for transfer', 'INVALID_STATE', callId);
    }

    console.log(`MockWebphoneProvider: ${warm ? 'Warm' : 'Blind'} transferring call ${callId} to ${target}`);

    call.state = CallState.TRANSFERRING;

    this.emit({
      type: 'transfer_initiated',
      callId,
      target,
      timestamp: new Date().toISOString()
    });

    // Simulate transfer completion
    setTimeout(() => {
      if (this.calls.has(callId)) {
        this.emit({
          type: 'transfer_completed',
          callId,
          timestamp: new Date().toISOString()
        });

        // End the call after transfer
        this.hangup(callId);
      }
    }, 2000);
  }

  async sendDTMF(callId: string, digits: string): Promise<void> {
    const call = this.calls.get(callId);
    if (!call) {
      throw new CallError('Call not found', 'CALL_NOT_FOUND', callId);
    }

    if (call.state !== CallState.IN_CALL) {
      throw new CallError('Call not in valid state for DTMF', 'INVALID_STATE', callId);
    }

    console.log(`MockWebphoneProvider: Sending DTMF ${digits} on call ${callId}`);

    this.emit({
      type: 'dtmf_sent',
      callId,
      digits,
      timestamp: new Date().toISOString()
    });
  }

  async setDevices(dev: { inputId?: string; outputId?: string }): Promise<void> {
    console.log('MockWebphoneProvider: Setting devices', dev);
    
    // Validate device IDs exist
    const devices = await this.getDevices();
    
    if (dev.inputId && !devices.input.find(d => d.deviceId === dev.inputId)) {
      throw new DeviceError(`Input device not found: ${dev.inputId}`, 'DEVICE_NOT_FOUND');
    }
    
    if (dev.outputId && !devices.output.find(d => d.deviceId === dev.outputId)) {
      throw new DeviceError(`Output device not found: ${dev.outputId}`, 'DEVICE_NOT_FOUND');
    }

    this.devices = { ...this.devices, ...dev };
    console.log('MockWebphoneProvider: Devices updated', this.devices);
  }

  async getDevices(): Promise<{ input: MediaDeviceInfo[]; output: MediaDeviceInfo[] }> {
    // Mock device enumeration
    const mockInputs: MediaDeviceInfo[] = [
      { deviceId: 'default', groupId: 'group1', kind: 'audioinput', label: 'Default Microphone' } as MediaDeviceInfo,
      { deviceId: 'mic1', groupId: 'group1', kind: 'audioinput', label: 'Built-in Microphone' } as MediaDeviceInfo,
      { deviceId: 'mic2', groupId: 'group2', kind: 'audioinput', label: 'USB Headset Microphone' } as MediaDeviceInfo,
    ];

    const mockOutputs: MediaDeviceInfo[] = [
      { deviceId: 'default', groupId: 'group1', kind: 'audiooutput', label: 'Default Speaker' } as MediaDeviceInfo,
      { deviceId: 'speaker1', groupId: 'group1', kind: 'audiooutput', label: 'Built-in Speaker' } as MediaDeviceInfo,
      { deviceId: 'speaker2', groupId: 'group2', kind: 'audiooutput', label: 'USB Headset Speaker' } as MediaDeviceInfo,
    ];

    return {
      input: mockInputs,
      output: mockOutputs
    };
  }

  getStatus() {
    return {
      registered: this.registered,
      connecting: this.connecting,
      error: this.error
    };
  }

  on(cb: (e: WebphoneEvent) => void): () => void {
    this.eventListeners.push(cb);
    
    return () => {
      const index = this.eventListeners.indexOf(cb);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  async destroy(): Promise<void> {
    console.log('MockWebphoneProvider: Destroying');
    
    // Clear timers
    if (this.inboundCallTimer) {
      clearTimeout(this.inboundCallTimer);
    }
    if (this.registrationTimer) {
      clearTimeout(this.registrationTimer);
    }

    // End all calls
    for (const call of this.calls.values()) {
      await this.hangup(call.id);
    }

    // Unregister
    if (this.registered) {
      await this.unregister();
    }

    // Clear listeners
    this.eventListeners = [];
  }

  private emit(event: WebphoneEvent): void {
    console.log('MockWebphoneProvider: Event emitted', event);
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  private generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private simulateOutboundCall(callId: string): void {
    const call = this.calls.get(callId);
    if (!call) return;

    // Start with ringing
    setTimeout(() => {
      if (this.calls.has(callId)) {
        call.state = CallState.RINGING_OUT;
        this.emit({
          type: 'ringing',
          callId,
          timestamp: new Date().toISOString()
        });
      }
    }, 500);

    // Randomly connect, busy, or no answer
    setTimeout(() => {
      if (!this.calls.has(callId)) return;

      const outcome = Math.random();
      
      if (outcome < 0.7) {
        // Connected
        call.state = CallState.IN_CALL;
        call.stream = this.createMockAudioStream();
        
        this.emit({
          type: 'connected',
          callId,
          timestamp: new Date().toISOString()
        });

        if (call.stream) {
          this.emit({
            type: 'remoteStream',
            callId,
            stream: call.stream,
            timestamp: new Date().toISOString()
          });
        }

        // Auto-end after random duration (for testing)
        this.scheduleRandomCallEnd(callId);
        
      } else if (outcome < 0.85) {
        // No answer
        call.state = CallState.ENDED;
        this.emit({
          type: 'ended',
          callId,
          reason: 'no_answer',
          timestamp: new Date().toISOString()
        });
        setTimeout(() => this.calls.delete(callId), 1000);
        
      } else {
        // Busy
        call.state = CallState.ENDED;
        this.emit({
          type: 'ended',
          callId,
          reason: 'busy',
          timestamp: new Date().toISOString()
        });
        setTimeout(() => this.calls.delete(callId), 1000);
      }
    }, 3000 + Math.random() * 2000);
  }

  private startInboundCallSimulation(): void {
    const scheduleNext = () => {
      // Random interval between 30-90 seconds
      const interval = (30 + Math.random() * 60) * 1000;
      
      this.inboundCallTimer = setTimeout(() => {
        if (this.registered) {
          this.simulateInboundCall();
        }
        scheduleNext();
      }, interval);
    };

    scheduleNext();
  }

  private simulateInboundCall(): void {
    const callId = this.generateCallId();
    const mockNumbers = [
      '+1234567890',
      '+1987654321', 
      '+1555123456',
      '+1444987654',
      '+1333555777'
    ];
    
    const from = mockNumbers[Math.floor(Math.random() * mockNumbers.length)];
    const fromDisplay = `Caller ${Math.floor(Math.random() * 1000)}`;

    const call: MockCall = {
      id: callId,
      peer: from,
      direction: CallDirection.INBOUND,
      state: CallState.RINGING_IN,
      startedAt: new Date().toISOString()
    };

    this.calls.set(callId, call);

    console.log(`MockWebphoneProvider: Simulating inbound call from ${from}`);

    this.emit({
      type: 'incoming',
      callId,
      from,
      fromDisplay,
      timestamp: new Date().toISOString()
    });

    // Auto-end if not answered within 30 seconds
    setTimeout(() => {
      if (this.calls.has(callId) && call.state === CallState.RINGING_IN) {
        call.state = CallState.ENDED;
        this.emit({
          type: 'ended',
          callId,
          reason: 'timeout',
          timestamp: new Date().toISOString()
        });
        setTimeout(() => this.calls.delete(callId), 1000);
      }
    }, 30000);
  }

  private scheduleRandomCallEnd(callId: string): void {
    // End call after 30 seconds to 5 minutes for testing
    const duration = (30 + Math.random() * 270) * 1000;
    
    setTimeout(() => {
      if (this.calls.has(callId)) {
        this.hangup(callId);
      }
    }, duration);
  }

  private createMockAudioStream(): MediaStream {
    // Create a mock audio context for testing
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const destination = audioContext.createMediaStreamDestination();
      
      oscillator.connect(destination);
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.start();
      
      return destination.stream;
    } catch (error) {
      console.warn('Could not create mock audio stream:', error);
      // Return empty stream if audio context fails
      return new MediaStream();
    }
  }
}