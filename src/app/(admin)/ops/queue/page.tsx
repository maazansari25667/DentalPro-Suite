'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Filter, Search, Volume2, VolumeX, Users, Building } from 'lucide-react';

import { QueueBoard } from './QueueBoard';
import { NowServingTicker } from './NowServingTicker';
import { useQueue } from '@/lib/hooks/useQueue';
import { useDentists } from '@/lib/hooks/useResources';
import { useRooms } from '@/lib/hooks/useResources';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';

export type QueueLayout = 'byDentist' | 'byRoom';

export default function QueuePage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDentists, setSelectedDentists] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [urgentFirst, setUrgentFirst] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [layout, setLayout] = useState<QueueLayout>('byDentist');

  const { data: queueData = [], isLoading } = useQueue();

  const { data: dentists = [] } = useDentists();
  const { data: rooms = [] } = useRooms();

  // Filter and sort queue data
  const filteredQueue = queueData.filter(ticket => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const patientName = `${ticket.patient.firstName} ${ticket.patient.lastName}`.toLowerCase();
      const procedure = ticket.procedure?.name?.toLowerCase() || '';
      if (!patientName.includes(searchLower) && !procedure.includes(searchLower)) {
        return false;
      }
    }
    return true;
  });

  const sortedQueue = [...filteredQueue].sort((a, b) => {
    if (urgentFirst) {
      const priorityOrder = { 'emergency': 0, 'urgent': 1, 'high': 2, 'normal': 3, 'low': 4 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 5;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 5;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
    }
    
    return a.queuePosition - b.queuePosition;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBreadCrumb pageTitle="Queue Board" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Left Controls */}
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Date Picker */}
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Layout Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLayout('byDentist')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    layout === 'byDentist'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>By Dentist</span>
                </button>
                <button
                  onClick={() => setLayout('byRoom')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    layout === 'byRoom'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Building className="h-4 w-4" />
                  <span>By Room</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-4">
              
              {/* Urgent First Toggle */}
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={urgentFirst}
                  onChange={(e) => setUrgentFirst(e.target.checked)}
                  className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                />
                <span className="text-gray-700">Urgent first</span>
              </label>

              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-md transition-colors ${
                  soundEnabled
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                }`}
                title={soundEnabled ? 'Disable sound' : 'Enable sound'}
              >
                {soundEnabled ? (
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
              </button>

              {/* Filter Button */}
              <Button variant="outline" startIcon={<Filter className="h-4 w-4" />}>
                Filters
              </Button>
            </div>
          </div>

          {/* Filter Chips */}
          {(selectedDentists.length > 0 || selectedRooms.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
              {selectedDentists.map(dentistId => {
                const dentist = dentists.find(d => d.id === dentistId);
                return dentist ? (
                  <span
                    key={dentistId}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    Dr. {dentist.lastName}
                    <button
                      onClick={() => setSelectedDentists(prev => prev.filter(id => id !== dentistId))}
                      className="ml-2 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                ) : null;
              })}
              
              {selectedRooms.map(roomId => {
                const room = rooms.find(r => r.id === roomId);
                return room ? (
                  <span
                    key={roomId}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                  >
                    {room.name}
                    <button
                      onClick={() => setSelectedRooms(prev => prev.filter(id => id !== roomId))}
                      className="ml-2 hover:text-green-600"
                    >
                      ×
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Queue Board */}
        <div className="mb-6">
          <QueueBoard
            queue={sortedQueue}
            layout={layout}
            dentists={dentists}
            rooms={rooms}
            isLoading={isLoading}
            soundEnabled={soundEnabled}
          />
        </div>

        {/* Now Serving Ticker */}
        <div className="fixed bottom-0 left-0 right-0 z-30">
          <NowServingTicker soundEnabled={soundEnabled} />
        </div>
      </div>
    </div>
  );
}