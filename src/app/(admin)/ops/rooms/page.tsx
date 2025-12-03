'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/button/Button';
import { AlertTriangle, Timer, CalendarDays } from 'lucide-react';
import { useQueue } from '@/lib/hooks/useQueue';
import { useAppointments } from '@/lib/hooks/useAppointments';
import { QueueStatus } from '@/lib/domain';
import { format, addMinutes, isSameDay, parseISO } from 'date-fns';

interface TimeSlot {
  time: string;
  timestamp: Date;
}

interface RoomScheduleItem {
  id: string;
  type: 'appointment' | 'queue-ticket' | 'turnover';
  title: string;
  patient?: string;
  startTime: Date;
  endTime: Date;
  status: string;
  priority?: string;
  roomId: string;
  conflict?: boolean;
}

interface TurnoverState {
  [roomId: string]: {
    id: string;
    startTime: Date;
    duration: number; // minutes
    remainingTime: number; // seconds
    isActive: boolean;
  };
}

const ROOMS = [
  { id: 'room-1', name: 'Room 1', color: 'bg-blue-100 border-blue-300' },
  { id: 'room-2', name: 'Room 2', color: 'bg-green-100 border-green-300' },
  { id: 'room-3', name: 'Room 3', color: 'bg-purple-100 border-purple-300' },
  { id: 'room-4', name: 'Room 4', color: 'bg-orange-100 border-orange-300' },
  { id: 'room-5', name: 'Room 5', color: 'bg-pink-100 border-pink-300' },
  { id: 'room-6', name: 'Room 6', color: 'bg-cyan-100 border-cyan-300' },
];

const SLOT_DURATION = 15; // minutes
const SLOTS_COUNT = 32; // 8 hours = 32 slots of 15 minutes

export default function RoomsPage() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [turnoverTimers, setTurnoverTimers] = useState<TurnoverState>({});
  const [scheduleItems, setScheduleItems] = useState<RoomScheduleItem[]>([]);

  const { data: queue } = useQueue();
  const { data: appointments } = useAppointments();

  // Generate time slots for the day
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startTime = new Date();
    startTime.setHours(8, 0, 0, 0); // Start at 8:00 AM

    for (let i = 0; i < SLOTS_COUNT; i++) {
      const slotTime = addMinutes(startTime, i * SLOT_DURATION);
      slots.push({
        time: format(slotTime, 'HH:mm'),
        timestamp: slotTime,
      });
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Convert appointments and queue tickets to schedule items
  useEffect(() => {
    const items: RoomScheduleItem[] = [];
    const selectedDateObj = parseISO(selectedDate);

    // Add appointments
    if (appointments) {
      appointments
        .filter(apt => isSameDay(parseISO(apt.scheduledStart), selectedDateObj))
        .forEach(apt => {
          const startTime = parseISO(apt.scheduledStart);
          
          items.push({
            id: apt.id,
            type: 'appointment',
            title: `${apt.patient.firstName} ${apt.patient.lastName}`,
            patient: `${apt.patient.firstName} ${apt.patient.lastName}`,
            startTime,
            endTime: addMinutes(startTime, apt.scheduledMinutes),
            status: apt.status,
            priority: apt.priority,
            roomId: apt.room?.id || 'unassigned',
          });
        });
    }

    // Add active queue tickets with room assignments
    if (queue) {
      queue
        .filter(ticket => ticket.room && (ticket.status === QueueStatus.IN_TREATMENT || ticket.status === QueueStatus.WAITING))
        .forEach(ticket => {
          const startTime = ticket.actualStartTime ? parseISO(ticket.actualStartTime) : new Date();
          const estimatedDuration = ticket.estimatedDuration || 30;
          
          items.push({
            id: ticket.id,
            type: 'queue-ticket',
            title: `${ticket.patient.firstName} ${ticket.patient.lastName}`,
            patient: `${ticket.patient.firstName} ${ticket.patient.lastName}`,
            startTime,
            endTime: addMinutes(startTime, estimatedDuration),
            status: ticket.status,
            priority: ticket.priority,
            roomId: ticket.room!.id,
          });
        });
    }

    // Add turnover timers
    Object.entries(turnoverTimers).forEach(([roomId, timer]) => {
      if (timer.isActive) {
        items.push({
          id: timer.id,
          type: 'turnover',
          title: 'Room Turnover',
          startTime: timer.startTime,
          endTime: addMinutes(timer.startTime, timer.duration),
          status: 'in_progress',
          roomId,
        });
      }
    });

    // Detect conflicts
    items.forEach((item, index) => {
      const conflicts = items
        .filter((other, otherIndex) => 
          otherIndex !== index && 
          other.roomId === item.roomId &&
          other.type !== 'turnover' &&
          item.type !== 'turnover' &&
          (
            (item.startTime < other.endTime && item.endTime > other.startTime)
          )
        );
      
      if (conflicts.length > 0) {
        item.conflict = true;
        conflicts.forEach(c => c.conflict = true);
      }
    });

    setScheduleItems(items);
  }, [appointments, queue, turnoverTimers, selectedDate]);

  // Start turnover timer when a ticket is completed
  const startTurnoverTimer = (roomId: string, duration = 7) => {
    const timerId = `turnover-${roomId}-${Date.now()}`;
    const startTime = new Date();
    
    setTurnoverTimers(prev => ({
      ...prev,
      [roomId]: {
        id: timerId,
        startTime,
        duration,
        remainingTime: duration * 60, // convert to seconds
        isActive: true,
      }
    }));

    // Countdown timer
    const interval = setInterval(() => {
      setTurnoverTimers(prev => {
        const timer = prev[roomId];
        if (!timer || timer.remainingTime <= 1) {
          clearInterval(interval);
          return {
            ...prev,
            [roomId]: { ...timer, isActive: false, remainingTime: 0 }
          };
        }

        return {
          ...prev,
          [roomId]: { ...timer, remainingTime: timer.remainingTime - 1 }
        };
      });
    }, 1000);
  };

  // Format remaining time for display
  const formatRemainingTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Check if a time slot overlaps with an item
  const getSlotItems = (slotTime: Date, roomId: string): RoomScheduleItem[] => {
    return scheduleItems.filter(item => 
      item.roomId === roomId &&
      slotTime >= item.startTime &&
      slotTime < item.endTime
    );
  };

  // Get conflict status for time slot
  const hasConflict = (slotTime: Date, roomId: string): boolean => {
    return getSlotItems(slotTime, roomId).some(item => item.conflict);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Schedule Matrix</h1>
          <p className="text-gray-600 mt-1">Real-time room occupancy and turnover management</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Date Picker */}
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Test Turnover Button */}
          <Button
            onClick={() => startTurnoverTimer('room-1', 5)}
            variant="outline"
            className="text-sm"
          >
            Test Turnover (Room 1)
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm">Appointment</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm">Queue Ticket</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm">Turnover</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-amber-500 rounded"></div>
          <span className="text-sm">Conflict</span>
        </div>
      </div>

      {/* Rooms Matrix */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          <div className="p-4 border-r font-medium text-gray-700">Time</div>
          {ROOMS.map(room => (
            <div key={room.id} className="p-4 border-r font-medium text-gray-700 text-center relative">
              {room.name}
              {turnoverTimers[room.id]?.isActive && (
                <div className="absolute top-1 right-1 flex items-center space-x-1">
                  <Timer className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-mono text-red-600">
                    {formatRemainingTime(turnoverTimers[room.id].remainingTime)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Time Slot Rows */}
        <div className="max-h-96 overflow-y-auto">
          {timeSlots.map((slot, slotIndex) => (
            <div key={slot.time} className={`grid grid-cols-7 border-b hover:bg-gray-50 ${
              slotIndex % 4 === 0 ? 'border-b-2 border-gray-200' : ''
            }`}>
              {/* Time Column */}
              <div className={`p-2 border-r text-sm text-gray-600 font-mono ${
                slotIndex % 4 === 0 ? 'font-semibold' : ''
              }`}>
                {slot.time}
              </div>

              {/* Room Columns */}
              {ROOMS.map(room => {
                const slotItems = getSlotItems(slot.timestamp, room.id);
                const hasActiveTimer = turnoverTimers[room.id]?.isActive;
                const isConflicted = hasConflict(slot.timestamp, room.id);

                return (
                  <div key={room.id} className={`p-1 border-r relative min-h-12 ${
                    hasActiveTimer ? 'bg-red-100' : ''
                  } ${isConflicted ? 'bg-amber-100' : ''}`}>
                    {slotItems.map((item, itemIndex) => (
                      <div
                        key={`${item.id}-${itemIndex}`}
                        className={`text-xs p-2 rounded mb-1 border ${
                          item.type === 'appointment' 
                            ? 'bg-blue-500 text-white border-blue-600' 
                            : item.type === 'queue-ticket'
                            ? 'bg-green-500 text-white border-green-600'
                            : 'bg-red-500 text-white border-red-600'
                        } ${item.conflict ? 'ring-2 ring-amber-500' : ''}`}
                      >
                        <div className="font-semibold truncate">{item.title}</div>
                        {item.patient && (
                          <div className="opacity-90 truncate">{item.patient}</div>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="opacity-75">{item.status}</span>
                          {item.priority === 'emergency' && (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Turnover Timer Display */}
                    {hasActiveTimer && slotItems.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-red-600 text-center">
                          <Timer className="h-4 w-4 mx-auto mb-1" />
                          <div className="text-xs font-mono">
                            {formatRemainingTime(turnoverTimers[room.id].remainingTime)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Active Turnovers Summary */}
      {Object.values(turnoverTimers).some(t => t.isActive) && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Active Turnover Timers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(turnoverTimers)
              .filter(([, timer]) => timer.isActive)
              .map(([roomId, timer]) => {
                const room = ROOMS.find(r => r.id === roomId);
                const isOvertime = timer.remainingTime <= 0;
                
                return (
                  <div key={roomId} className={`p-4 rounded-lg border-2 ${
                    isOvertime 
                      ? 'bg-red-50 border-red-300 text-red-800'
                      : 'bg-yellow-50 border-yellow-300 text-yellow-800'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{room?.name}</h4>
                      <Timer className="h-5 w-5" />
                    </div>
                    <div className="text-sm space-y-1">
                      <p>Started: {format(timer.startTime, 'HH:mm')}</p>
                      <p className="font-mono text-lg">
                        {isOvertime ? 'OVERTIME: ' : ''}
                        {formatRemainingTime(Math.abs(timer.remainingTime))}
                      </p>
                      {isOvertime && (
                        <p className="text-red-700 font-medium">
                          ⚠️ Turnover is running late
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Conflict Alerts */}
      {scheduleItems.some(item => item.conflict) && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-amber-800">Schedule Conflicts Detected</h3>
          </div>
          <p className="text-amber-700 text-sm">
            Multiple items are scheduled for the same room at the same time. Please review and resolve conflicts.
          </p>
        </div>
      )}
    </div>
  );
}