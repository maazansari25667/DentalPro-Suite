/**
 * Communications workspace page at /comms/phone
 * Comprehensive webphone interface with Dialer, Recents, Contacts, Voicemail, Settings
 */

"use client";

import { useState } from 'react';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { Phone, History, Users, Voicemail, Settings, PhoneCall, PhoneIncoming, PhoneOutgoing } from 'lucide-react';
import { Dialer } from '@/components/webphone/Dialer';
import { useWebphone } from '@/lib/telephony/useWebphone';
import { useTelephonyStore } from '@/lib/telephony/state';
import { CallDirection, CallDisposition } from '@/lib/telephony/provider-adapter';

// Temporary imports - these would come from actual API hooks
import { useQuery } from '@tanstack/react-query';

function cn(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default function CommunicationsPage() {
  const [state, actions] = useWebphone();
  const store = useTelephonyStore();
  const [activeTab, setActiveTab] = useState("dialer");

  // Fetch call logs
  const { data: callLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['telephony', 'logs'],
    queryFn: async () => {
      const response = await fetch('/api/telephony/logs?limit=50');
      const result = await response.json();
      return result.data;
    }
  });

  // Fetch voicemail
  const { data: voicemailData, isLoading: vmLoading } = useQuery({
    queryKey: ['telephony', 'voicemail'],
    queryFn: async () => {
      const response = await fetch('/api/telephony/voicemail');
      const result = await response.json();
      return result.data;
    }
  });

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ['telephony', 'analytics'],
    queryFn: async () => {
      const response = await fetch('/api/telephony/analytics');
      const result = await response.json();
      return result.data;
    }
  });

  const handleDial = async (number: string) => {
    try {
      await actions.dial(number);
      store.setDialerValue('');
    } catch (error) {
      console.error('Failed to dial:', error);
    }
  };

  const getCallDirection = (direction: CallDirection) => {
    const config = {
      [CallDirection.INBOUND]: {
        icon: PhoneIncoming,
        color: 'success' as const,
        label: 'Inbound'
      },
      [CallDirection.OUTBOUND]: {
        icon: PhoneOutgoing,
        color: 'primary' as const,
        label: 'Outbound'
      }
    };
    return config[direction] || config[CallDirection.OUTBOUND];
  };

  const getDispositionBadge = (disposition: CallDisposition) => {
    const configs = {
      [CallDisposition.REACHED]: { color: 'success' as const, label: 'Reached' },
      [CallDisposition.BUSY]: { color: 'warning' as const, label: 'Busy' },
      [CallDisposition.NO_ANSWER]: { color: 'warning' as const, label: 'No Answer' },
      [CallDisposition.DECLINED]: { color: 'error' as const, label: 'Declined' },
      [CallDisposition.LEFT_VM]: { color: 'info' as const, label: 'Left VM' },
      [CallDisposition.WRONG_NUMBER]: { color: 'error' as const, label: 'Wrong Number' },
      [CallDisposition.OTHER]: { color: 'dark' as const, label: 'Other' }
    };
    const config = configs[disposition] || configs[CallDisposition.OTHER];
    return (
      <Badge color={config.color} size="sm">
        {config.label}
      </Badge>
    );
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const TabButton = ({ id, icon: Icon, label, isActive, onClick }: any) => (
    <button
      onClick={() => onClick(id)}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
        isActive 
          ? "bg-blue-600 text-white" 
          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Communications
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Webphone interface for calls, contacts, and voicemail
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</div>
          <div className="flex items-center justify-center gap-2">
            {state.isRegistered ? (
              <Badge color="success" size="sm">Online</Badge>
            ) : (
              <Badge color="error" size="sm">Offline</Badge>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Calls</div>
          <div className="text-lg font-semibold">{state.calls.length}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Voicemail</div>
          <div className="text-lg font-semibold">{voicemailData?.length || 0}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Today&apos;s Calls</div>
          <div className="text-lg font-semibold">{analytics?.today?.totalCalls || 0}</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <TabButton
          id="dialer"
          icon={Phone}
          label="Dialer"
          isActive={activeTab === "dialer"}
          onClick={setActiveTab}
        />
        <TabButton
          id="recents"
          icon={History}
          label="Recents"
          isActive={activeTab === "recents"}
          onClick={setActiveTab}
        />
        <TabButton
          id="contacts"
          icon={Users}
          label="Contacts"
          isActive={activeTab === "contacts"}
          onClick={setActiveTab}
        />
        <TabButton
          id="voicemail"
          icon={Voicemail}
          label="Voicemail"
          isActive={activeTab === "voicemail"}
          onClick={setActiveTab}
        />
        <TabButton
          id="settings"
          icon={Settings}
          label="Settings"
          isActive={activeTab === "settings"}
          onClick={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        {activeTab === "dialer" && (
          <div className="max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-4 text-center">Phone Dialer</h2>
            <Dialer
              value={store.ui.dialerValue}
              onChange={store.setDialerValue}
              onDial={handleDial}
              disabled={!actions.canCall()}
              autoFocus
            />
          </div>
        )}

        {activeTab === "recents" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Recent Calls</h2>
            {logsLoading ? (
              <div className="text-center py-8">Loading call history...</div>
            ) : callLogs?.length ? (
              <div className="space-y-2">
                {callLogs.slice(0, 20).map((call: any) => {
                  const dirConfig = getCallDirection(call.direction);
                  const DirectionIcon = dirConfig.icon;
                  return (
                    <div
                      key={call.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <DirectionIcon className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">
                            {call.peerDisplay || call.peer}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTime(call.startTime)} • {call.duration ? formatDuration(call.duration) : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getDispositionBadge(call.disposition)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDial(call.peer)}
                          disabled={!actions.canCall()}
                        >
                          <PhoneCall className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent calls
              </div>
            )}
          </div>
        )}

        {activeTab === "contacts" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Contacts</h2>
            <div className="text-center py-8 text-gray-500">
              Contact management coming soon...
            </div>
          </div>
        )}

        {activeTab === "voicemail" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Voicemail</h2>
            {vmLoading ? (
              <div className="text-center py-8">Loading voicemail...</div>
            ) : voicemailData?.length ? (
              <div className="space-y-3">
                {voicemailData.map((vm: any) => (
                  <div
                    key={vm.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-3 w-3 rounded-full",
                        vm.isNew ? "bg-blue-500" : "bg-gray-300"
                      )} />
                      <div>
                        <div className="font-medium">
                          {vm.callerDisplay || vm.caller}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTime(vm.timestamp)} • {vm.duration}s
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Play
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDial(vm.caller)}
                      >
                        <PhoneCall className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No voicemail messages
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-2">Connection Status</h3>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    state.isRegistered ? "bg-green-500" : "bg-red-500"
                  )} />
                  <span className="text-sm">
                    {state.isRegistered ? 'Connected to telephony service' : 'Disconnected'}
                  </span>
                </div>
                {!state.isRegistered && (
                  <Button 
                    className="mt-2" 
                    size="sm"
                    onClick={actions.register}
                    disabled={state.isRegistering}
                  >
                    {state.isRegistering ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-2">Audio Settings</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Current microphone: {store.availableDevices.input.find(d => d.deviceId === store.settings.devices.inputId)?.label || 'Default'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Current speaker: {store.availableDevices.output.find(d => d.deviceId === store.settings.devices.outputId)?.label || 'Default'}
                </div>
                <Button variant="outline" size="sm">
                  Configure Audio
                </Button>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-2">Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Total Calls</div>
                    <div className="font-medium">{store.callHistory.length}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Active Calls</div>
                    <div className="font-medium">{state.calls.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}