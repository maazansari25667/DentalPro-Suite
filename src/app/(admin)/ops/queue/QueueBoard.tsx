'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import toast from 'react-hot-toast';

import { QueueLane } from './QueueLane';
import { QueueTicket, DentistRef, Room } from '@/lib/domain';
import { useUpdateQueueTicket } from '@/lib/hooks/useQueue';
import { estimateEta, ETAResult } from '@/lib/eta';
import { QueueLayout } from './page';

interface QueueBoardProps {
  queue: QueueTicket[];
  layout: QueueLayout;
  dentists: DentistRef[];
  rooms: Room[];
  isLoading: boolean;
  soundEnabled: boolean;
}

export function QueueBoard({
  queue,
  layout,
  dentists,
  rooms,
  isLoading,
  soundEnabled
}: QueueBoardProps) {
  const [draggedTicket, setDraggedTicket] = useState<QueueTicket | null>(null);
  const [etaResults, setEtaResults] = useState<ETAResult[]>([]);
  
  const updateTicketMutation = useUpdateQueueTicket();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start dragging
      },
    })
  );

  // Calculate ETAs when queue changes
  useEffect(() => {
    if (queue.length > 0) {
      const results = estimateEta({
        queue,
        turnoverTime: 5,
        globalAverageTime: 30,
      });
      setEtaResults(results);
    }
  }, [queue]);

  // Group tickets by lanes
  const lanes = groupTicketsByLanes(queue, layout, dentists, rooms);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ticket = queue.find(t => t.id === active.id);
    setDraggedTicket(ticket || null);
  };

  // Handle drag over (for cross-lane moves)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    // Check if we're dropping over a lane
    const overLaneId = over.data.current?.laneId;
    if (overLaneId && draggedTicket) {
      // This is handled in dragEnd for actual updates
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedTicket(null);

    if (!over || active.id === over.id) return;

    const activeTicket = queue.find(t => t.id === active.id);
    if (!activeTicket) return;

    try {
      // Determine if this is a cross-lane move or reordering
      const overLaneId = over.data.current?.laneId;
      const overTicketId = over.data.current?.ticketId;
      
      if (overLaneId && overLaneId !== getLaneId(activeTicket, layout)) {
        // Cross-lane move: reassign dentist or room
        await handleCrossLaneMove(activeTicket, overLaneId);
      } else if (overTicketId) {
        // Reordering within same lane
        await handleReorderInLane(activeTicket, overTicketId);
      }
    } catch (error) {
      console.error('Failed to update queue position:', error);
      toast.error('Failed to update queue position');
    }
  };

  // Handle cross-lane movement
  const handleCrossLaneMove = async (ticket: QueueTicket, targetLaneId: string) => {
    const updateData: Record<string, any> = {};
    
    if (layout === 'byDentist') {
      const dentist = dentists.find(d => d.id === targetLaneId);
      if (dentist) {
        updateData.dentistId = dentist.id;
      }
    } else {
      const room = rooms.find(r => r.id === targetLaneId);
      if (room) {
        updateData.roomId = room.id;
      }
    }

    await updateTicketMutation.mutateAsync({
      ticketId: ticket.id,
      updates: updateData,
    });

    toast.success('Ticket reassigned successfully');
  };

  // Handle reordering within lane
  const handleReorderInLane = async (activeTicket: QueueTicket, overTicketId: string) => {
    const overTicket = queue.find(t => t.id === overTicketId);
    if (!overTicket) return;

    // Calculate new position
    const newPosition = overTicket.queuePosition;

    await updateTicketMutation.mutateAsync({
      ticketId: activeTicket.id,
      updates: { queuePosition: newPosition },
    });

    toast.success('Queue position updated');
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(j => (
                <div key={j} className="h-24 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Object.entries(lanes).map(([laneId, laneData]) => (
          <QueueLane
            key={laneId}
            laneId={laneId}
            title={laneData.title}
            tickets={laneData.tickets}
            etaResults={etaResults}
            soundEnabled={soundEnabled}
          />
        ))}
      </div>
    </DndContext>
  );
}

// Helper functions
function groupTicketsByLanes(
  queue: QueueTicket[],
  layout: QueueLayout,
  dentists: DentistRef[],
  rooms: Room[]
) {
  const lanes: Record<string, { title: string; tickets: QueueTicket[] }> = {};

  if (layout === 'byDentist') {
    // Create lanes for each dentist
    dentists.forEach(dentist => {
      lanes[dentist.id] = {
        title: `Dr. ${dentist.lastName}`,
        tickets: queue.filter(t => t.dentist?.id === dentist.id),
      };
    });

    // Add unassigned lane
    const unassignedTickets = queue.filter(t => !t.dentist?.id);
    if (unassignedTickets.length > 0) {
      lanes['unassigned'] = {
        title: 'Unassigned',
        tickets: unassignedTickets,
      };
    }
  } else {
    // Create lanes for each room
    rooms.forEach(room => {
      lanes[room.id] = {
        title: room.name,
        tickets: queue.filter(t => t.room?.id === room.id),
      };
    });

    // Add unassigned lane
    const unassignedTickets = queue.filter(t => !t.room?.id);
    if (unassignedTickets.length > 0) {
      lanes['unassigned'] = {
        title: 'Waiting Room',
        tickets: unassignedTickets,
      };
    }
  }

  // Sort tickets within each lane
  Object.values(lanes).forEach(lane => {
    lane.tickets.sort((a, b) => a.queuePosition - b.queuePosition);
  });

  return lanes;
}

function getLaneId(ticket: QueueTicket, layout: QueueLayout): string {
  if (layout === 'byDentist') {
    return ticket.dentist?.id || 'unassigned';
  } else {
    return ticket.room?.id || 'unassigned';
  }
}