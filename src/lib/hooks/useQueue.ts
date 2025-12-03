import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  QueueTicket, 
  CreateQueueTicketRequest, 
  UpdateQueueTicketRequest,
  QueueFilters,
  QueueStatus,
  Priority 
} from '@/lib/domain';

// API functions
async function fetchQueue(): Promise<QueueTicket[]> {
  const response = await fetch('/api/queue');
  if (!response.ok) {
    throw new Error('Failed to fetch queue');
  }
  const data = await response.json();
  return data.data;
}

async function createQueueTicket(ticketData: CreateQueueTicketRequest): Promise<QueueTicket> {
  const response = await fetch('/api/queue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create queue ticket');
  }
  
  const data = await response.json();
  return data.data;
}

async function updateQueueTicket(id: string, updateData: UpdateQueueTicketRequest): Promise<QueueTicket> {
  const response = await fetch(`/api/queue/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update queue ticket');
  }
  
  const data = await response.json();
  return data.data;
}

async function deleteQueueTicket(id: string): Promise<void> {
  const response = await fetch(`/api/queue/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete queue ticket');
  }
}

// Queue Hook
export function useQueue() {
  return useQuery({
    queryKey: ['queue'],
    queryFn: fetchQueue,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

// Filtered Queue Hook
export function useFilteredQueue(filters?: QueueFilters) {
  const { data: queue, ...rest } = useQueue();
  
  const filteredData = queue?.filter(ticket => {
    if (!filters) return true;
    
    // Filter by dentist IDs
    if (filters.dentistIds?.length && ticket.dentist && !filters.dentistIds.includes(ticket.dentist.id)) {
      return false;
    }
    
    // Filter by room IDs
    if (filters.roomIds?.length && ticket.room && !filters.roomIds.includes(ticket.room.id)) {
      return false;
    }
    
    // Filter by status
    if (filters.status?.length && !filters.status.includes(ticket.status)) {
      return false;
    }
    
    // Filter by priority
    if (filters.priority?.length && !filters.priority.includes(ticket.priority)) {
      return false;
    }
    
    // Show urgent only
    if (filters.showUrgentOnly && 
        ticket.priority !== Priority.URGENT && 
        ticket.priority !== Priority.EMERGENCY) {
      return false;
    }
    
    return true;
  });

  return {
    data: filteredData,
    ...rest
  };
}

// Queue by Status Hooks
export function useWaitingQueue() {
  const { data: queue, ...rest } = useQueue();
  const waitingTickets = queue?.filter(ticket => ticket.status === QueueStatus.WAITING);
  
  return {
    data: waitingTickets,
    ...rest
  };
}

export function useInTreatmentQueue() {
  const { data: queue, ...rest } = useQueue();
  const inTreatmentTickets = queue?.filter(ticket => ticket.status === QueueStatus.IN_TREATMENT);
  
  return {
    data: inTreatmentTickets,
    ...rest
  };
}

// Create Queue Ticket Mutation
export function useCreateTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createQueueTicket,
    onMutate: async (newTicket) => {
      await queryClient.cancelQueries({ queryKey: ['queue'] });
      const previousQueue = queryClient.getQueryData(['queue']);
      
      // Optimistic update
      const optimisticTicket: QueueTicket = {
        id: `temp-${Date.now()}`,
        checkInId: newTicket.checkInId,
        patient: { id: 'temp', firstName: 'Loading', lastName: '...', phoneNumber: '', dateOfBirth: '', gender: 'other' as any },
        priority: newTicket.priority,
        status: QueueStatus.WAITING,
        ticketNumber: `T${Date.now()}`,
        estimatedDuration: newTicket.estimatedDuration,
        queuePosition: 999,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      queryClient.setQueryData(['queue'], (old: QueueTicket[] = []) => [
        ...old,
        optimisticTicket
      ]);
      
      return { previousQueue };
    },
    onError: (err, newTicket, context) => {
      queryClient.setQueryData(['queue'], context?.previousQueue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['checkins'] });
    },
  });
}

// Assign Ticket Mutation (assign dentist/room)
export function useAssignTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updateData }: { id: string; updateData: UpdateQueueTicketRequest }) => 
      updateQueueTicket(id, updateData),
    onMutate: async ({ id, updateData }) => {
      await queryClient.cancelQueries({ queryKey: ['queue'] });
      const previousQueue = queryClient.getQueryData(['queue']);
      
      // Optimistically update
      queryClient.setQueryData(['queue'], (old: QueueTicket[] = []) =>
        old.map(ticket => 
          ticket.id === id 
            ? { ...ticket, ...updateData, updatedAt: new Date().toISOString() }
            : ticket
        )
      );
      
      return { previousQueue };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['queue'], context?.previousQueue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

// Update Queue Ticket Mutation (General)
export function useUpdateQueueTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ticketId, updates }: { ticketId: string; updates: UpdateQueueTicketRequest }) => 
      updateQueueTicket(ticketId, updates),
    onMutate: async ({ ticketId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['queue'] });
      const previousQueue = queryClient.getQueryData(['queue']);
      
      // Optimistically update ticket
      queryClient.setQueryData(['queue'], (old: QueueTicket[] = []) =>
        old.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, ...updates, updatedAt: new Date().toISOString() }
            : ticket
        )
      );
      
      return { previousQueue };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['queue'], context?.previousQueue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

// Move Ticket Mutation (change position)
export function useMoveTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, position }: { id: string; position: number }) => 
      updateQueueTicket(id, { queuePosition: position }),
    onMutate: async ({ id, position }) => {
      await queryClient.cancelQueries({ queryKey: ['queue'] });
      const previousQueue = queryClient.getQueryData(['queue']);
      
      // Optimistically update position
      queryClient.setQueryData(['queue'], (old: QueueTicket[] = []) => {
        const updated = old.map(ticket => 
          ticket.id === id 
            ? { ...ticket, queuePosition: position, updatedAt: new Date().toISOString() }
            : ticket
        );
        // Re-sort by position
        return updated.sort((a, b) => a.queuePosition - b.queuePosition);
      });
      
      return { previousQueue };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['queue'], context?.previousQueue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}

// Update Ticket Status Mutation
export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: QueueStatus }) => 
      updateQueueTicket(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['queue'] });
      const previousQueue = queryClient.getQueryData(['queue']);
      
      // Optimistically update status
      queryClient.setQueryData(['queue'], (old: QueueTicket[] = []) =>
        old.map(ticket => 
          ticket.id === id 
            ? { 
                ...ticket, 
                status, 
                actualStartTime: status === QueueStatus.IN_TREATMENT ? new Date().toISOString() : ticket.actualStartTime,
                actualEndTime: status === QueueStatus.COMPLETED ? new Date().toISOString() : ticket.actualEndTime,
                updatedAt: new Date().toISOString() 
              }
            : ticket
        )
      );
      
      return { previousQueue };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['queue'], context?.previousQueue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

// Delete Ticket Mutation
export function useDeleteTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteQueueTicket,
    onMutate: async (ticketId) => {
      await queryClient.cancelQueries({ queryKey: ['queue'] });
      const previousQueue = queryClient.getQueryData(['queue']);
      
      // Optimistically remove ticket
      queryClient.setQueryData(['queue'], (old: QueueTicket[] = []) =>
        old.filter(ticket => ticket.id !== ticketId)
      );
      
      return { previousQueue };
    },
    onError: (err, ticketId, context) => {
      queryClient.setQueryData(['queue'], context?.previousQueue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}

// Queue Statistics Hook
export function useQueueStats() {
  const { data: queue } = useQueue();
  
  const stats = queue ? {
    total: queue.length,
    waiting: queue.filter(t => t.status === QueueStatus.WAITING).length,
    called: queue.filter(t => t.status === QueueStatus.CALLED).length,
    inTreatment: queue.filter(t => t.status === QueueStatus.IN_TREATMENT).length,
    completed: queue.filter(t => t.status === QueueStatus.COMPLETED).length,
    urgent: queue.filter(t => t.priority === Priority.URGENT || t.priority === Priority.EMERGENCY).length,
    averageWaitTime: 0, // Would need to calculate based on check-in time vs start time
    longestWaitTime: 0, // Would need to calculate based on oldest waiting ticket
    totalServedToday: queue.filter(t => t.status === QueueStatus.COMPLETED).length,
    roomUtilization: queue.reduce((acc, ticket) => {
      if (ticket.room && ticket.status === QueueStatus.IN_TREATMENT) {
        acc[ticket.room.id] = (acc[ticket.room.id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
    dentistWorkload: queue.reduce((acc, ticket) => {
      if (ticket.dentist && (ticket.status === QueueStatus.IN_TREATMENT || ticket.status === QueueStatus.WAITING)) {
        acc[ticket.dentist.id] = (acc[ticket.dentist.id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
    byPriority: queue.reduce((acc, ticket) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  } : null;
  
  return stats;
}