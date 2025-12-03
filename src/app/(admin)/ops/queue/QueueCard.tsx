'use client';

import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  User,
  AlertTriangle,
  Calendar,
  Stethoscope,
  MoreVertical,
  Play,
  Pause,
  CheckCircle,
  X,
  UserX,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { QueueTicket } from '@/lib/domain';
import { ETAResult, formatETA, formatWaitingTime, getRemainingTimeToSLA, isTicketOverdue } from '@/lib/eta';

interface QueueCardProps {
  ticket: QueueTicket;
  etaData?: ETAResult;
  soundEnabled: boolean;
}

export function QueueCard({ ticket, etaData, soundEnabled }: QueueCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [slaTimeLeft, setSlaTimeLeft] = useState<number>(0);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket.id,
    data: {
      ticketId: ticket.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Update SLA countdown for urgent/emergency tickets
  useEffect(() => {
    if (ticket.priority === 'urgent' || ticket.priority === 'emergency') {
      const updateSLA = () => {
        const remaining = getRemainingTimeToSLA(ticket);
        setSlaTimeLeft(remaining);
        
        // Play alert sound when SLA is exceeded
        if (remaining === 0 && soundEnabled) {
          playAlertSound();
          toast.error(`🚨 SLA exceeded for ${ticket.patient.firstName} ${ticket.patient.lastName}`, {
            duration: 6000,
          });
        }
      };

      updateSLA();
      const interval = setInterval(updateSLA, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, [ticket, soundEnabled]);

  // Priority styling
  const priorityConfig = {
    emergency: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      chipColor: 'bg-red-100 text-red-800',
      icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
    },
    urgent: {
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-400',
      chipColor: 'bg-orange-100 text-orange-800',
      icon: <AlertTriangle className="h-4 w-4 text-orange-600" />,
    },
    high: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      chipColor: 'bg-yellow-100 text-yellow-800',
      icon: null,
    },
    normal: {
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      chipColor: 'bg-gray-100 text-gray-800',
      icon: null,
    },
    low: {
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      chipColor: 'bg-gray-100 text-gray-600',
      icon: null,
    },
  };

  const config = priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.normal;
  const isOverdue = isTicketOverdue(ticket);

  const playAlertSound = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('SLA Alert');
      utterance.volume = 0.1;
      speechSynthesis.speak(utterance);
    }
  };

  const getPatientAge = () => {
    if (!ticket.patient.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(ticket.patient.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleAction = (action: string) => {
    setShowActions(false);
    // These would call actual API endpoints
    toast.success(`${action} action triggered for ${ticket.patient.firstName}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative ${config.bgColor} border-2 ${
        isOverdue ? 'border-red-500 animate-pulse' : config.borderColor
      } rounded-lg p-4 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md ${
        isDragging ? 'opacity-50 shadow-lg transform rotate-2' : ''
      }`}
    >
      {/* Priority Badge & SLA Timer */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {config.icon}
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.chipColor}`}>
            {ticket.priority.toUpperCase()}
          </span>
          
          {/* SLA Countdown for urgent/emergency */}
          {(ticket.priority === 'urgent' || ticket.priority === 'emergency') && (
            <span className={`text-xs font-bold px-2 py-1 rounded ${
              isOverdue ? 'bg-red-500 text-white' : slaTimeLeft < 10 ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              SLA: {isOverdue ? 'OVERDUE' : `${slaTimeLeft}m`}
            </span>
          )}
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="p-1 rounded hover:bg-gray-100"
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-[160px]">
              <button
                onClick={() => handleAction('Start Visit')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
              >
                <Play className="h-4 w-4 text-green-600" />
                <span>Start Visit</span>
              </button>
              <button
                onClick={() => handleAction('Pause')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
              >
                <Pause className="h-4 w-4 text-yellow-600" />
                <span>Pause</span>
              </button>
              <button
                onClick={() => handleAction('Complete')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Complete</span>
              </button>
              <button
                onClick={() => handleAction('No Show')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
              >
                <UserX className="h-4 w-4 text-orange-600" />
                <span>No Show</span>
              </button>
              <button
                onClick={() => handleAction('Remove')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-red-600"
              >
                <X className="h-4 w-4" />
                <span>Remove</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Patient Info */}
      <div className="mb-3">
        <div className="flex items-center space-x-2 mb-1">
          <User className="h-4 w-4 text-gray-500" />
          <h4 className="font-semibold text-gray-900">
            {ticket.patient.firstName} {ticket.patient.lastName}
          </h4>
          {getPatientAge() && (
            <span className="text-sm text-gray-500">({getPatientAge()}y)</span>
          )}
        </div>
        
        {ticket.procedure && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Stethoscope className="h-3 w-3" />
            <span>{ticket.procedure.name}</span>
          </div>
        )}
      </div>

      {/* Timing Info */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* ETA */}
        <div className="text-center bg-white bg-opacity-50 rounded p-2">
          <div className="text-xs text-gray-500 mb-1">ETA</div>
          <div className="font-semibold text-blue-600">
            {etaData ? formatETA(etaData.etaMinutes) : '--'}
          </div>
        </div>

        {/* Waiting Time */}
        <div className="text-center bg-white bg-opacity-50 rounded p-2">
          <div className="text-xs text-gray-500 mb-1">Waiting</div>
          <div className="font-semibold text-orange-600">
            {formatWaitingTime(ticket.createdAt)}
          </div>
        </div>
      </div>

      {/* Appointment Info */}
      {ticket.actualStartTime && (
        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
          <Calendar className="h-3 w-3" />
          <span>Started: {new Date(ticket.actualStartTime).toLocaleTimeString()}</span>
        </div>
      )}

      {/* Position Badge */}
      <div className="flex justify-between items-center">
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          Position #{etaData?.position || ticket.queuePosition}
        </span>
        
        {/* Status Badge */}
        <span className={`text-xs px-2 py-1 rounded ${
          ticket.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
          ticket.status === 'called' ? 'bg-green-100 text-green-800' :
          ticket.status === 'in_treatment' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {ticket.status.replace('_', ' ')}
        </span>
      </div>

      {/* Click-outside handler for actions menu */}
      {showActions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
}