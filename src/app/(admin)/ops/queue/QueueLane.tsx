'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { QueueCard } from './QueueCard';
import { QueueTicket } from '@/lib/domain';
import { ETAResult } from '@/lib/eta';

interface QueueLaneProps {
  laneId: string;
  title: string;
  tickets: QueueTicket[];
  etaResults: ETAResult[];
  soundEnabled: boolean;
}

export function QueueLane({
  laneId,
  title,
  tickets,
  etaResults,
  soundEnabled
}: QueueLaneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `lane-${laneId}`,
    data: {
      laneId,
    },
  });

  const ticketIds = tickets.map(ticket => ticket.id);

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-lg border-2 transition-colors ${
        isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
      }`}
    >
      {/* Lane Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {tickets.length} {tickets.length === 1 ? 'patient' : 'patients'}
          </span>
        </div>
      </div>

      {/* Lane Content */}
      <div className="p-4 space-y-3 min-h-[400px]">
        <SortableContext
          items={ticketIds}
          strategy={verticalListSortingStrategy}
        >
          {tickets.map((ticket) => {
            const etaData = etaResults.find(eta => eta.ticketId === ticket.id);
            
            return (
              <QueueCard
                key={ticket.id}
                ticket={ticket}
                etaData={etaData}
                soundEnabled={soundEnabled}
              />
            );
          })}
        </SortableContext>

        {/* Empty State */}
        {tickets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-sm">No patients in queue</p>
            <p className="text-xs text-gray-400 mt-1">
              Drop tickets here to assign
            </p>
          </div>
        )}
      </div>
    </div>
  );
}