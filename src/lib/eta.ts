import { QueueTicket, ProcedureRef } from '@/lib/domain';

export interface ETACalculationParams {
  queue: QueueTicket[];
  averageProcedureTimes?: Record<string, number>; // procedureId -> average minutes
  turnoverTime?: number; // minutes between patients
  globalAverageTime?: number; // fallback average time
}

export interface ETAResult {
  ticketId: string;
  etaMinutes: number;
  estimatedCompletionTime: Date;
  position: number;
}

/**
 * Calculate estimated time of arrival (ETA) for each ticket in the queue
 */
export function estimateEta(params: ETACalculationParams): ETAResult[] {
  const {
    queue,
    averageProcedureTimes = {},
    turnoverTime = 5, // 5 minutes default turnover
    globalAverageTime = 30, // 30 minutes default procedure time
  } = params;

  const now = new Date();
  const results: ETAResult[] = [];
  
  // Group tickets by dentist/room for more accurate calculations
  const lanes = groupTicketsByLane(queue);
  
  Object.entries(lanes).forEach(([laneId, tickets]) => {
    let cumulativeTime = 0;
    
    tickets.forEach((ticket, index) => {
      // Get procedure duration
      const procedureTime = getProcedureTime(ticket, averageProcedureTimes, globalAverageTime);
      
      // Add turnover time between patients (except for first patient)
      const totalTime = procedureTime + (index > 0 ? turnoverTime : 0);
      
      cumulativeTime += totalTime;
      
      const estimatedCompletionTime = new Date(now.getTime() + cumulativeTime * 60 * 1000);
      
      results.push({
        ticketId: ticket.id,
        etaMinutes: cumulativeTime,
        estimatedCompletionTime,
        position: index + 1,
      });
    });
  });
  
  return results;
}

/**
 * Group tickets by their assigned lane (dentist or room)
 */
function groupTicketsByLane(queue: QueueTicket[]): Record<string, QueueTicket[]> {
  const lanes: Record<string, QueueTicket[]> = {};
  
  queue.forEach(ticket => {
    // Use dentist ID or room ID as lane identifier
    const laneId = ticket.dentist?.id || ticket.room?.id || 'unassigned';
    
    if (!lanes[laneId]) {
      lanes[laneId] = [];
    }
    
    lanes[laneId].push(ticket);
  });
  
  // Sort tickets within each lane by queue position
  Object.keys(lanes).forEach(laneId => {
    lanes[laneId].sort((a, b) => a.queuePosition - b.queuePosition);
  });
  
  return lanes;
}

/**
 * Get estimated procedure time for a ticket
 */
function getProcedureTime(
  ticket: QueueTicket,
  averageProcedureTimes: Record<string, number>,
  globalAverageTime: number
): number {
  // Use estimated duration from ticket if available
  if (ticket.estimatedDuration) {
    return ticket.estimatedDuration;
  }
  
  // Use average time for this procedure type
  if (ticket.procedure?.id && averageProcedureTimes[ticket.procedure.id]) {
    return averageProcedureTimes[ticket.procedure.id];
  }
  
  // Use procedure's default duration
  if (ticket.procedure?.duration) {
    return ticket.procedure.duration;
  }
  
  // Fallback to global average
  return globalAverageTime;
}

/**
 * Calculate SLA deadline for urgent/emergency tickets
 */
export function calculateSLADeadline(ticket: QueueTicket): Date | null {
  if (!ticket.createdAt) return null;
  
  const createdAt = new Date(ticket.createdAt);
  let slaMinutes = 0;
  
  switch (ticket.priority) {
    case 'emergency':
      slaMinutes = 15; // 15 minutes for emergencies
      break;
    case 'urgent':
      slaMinutes = 45; // 45 minutes for urgent cases
      break;
    default:
      return null; // No SLA for other priorities
  }
  
  return new Date(createdAt.getTime() + slaMinutes * 60 * 1000);
}

/**
 * Check if a ticket has exceeded its SLA
 */
export function isTicketOverdue(ticket: QueueTicket): boolean {
  const deadline = calculateSLADeadline(ticket);
  if (!deadline) return false;
  
  return new Date() > deadline;
}

/**
 * Get remaining time until SLA deadline
 */
export function getRemainingTimeToSLA(ticket: QueueTicket): number {
  const deadline = calculateSLADeadline(ticket);
  if (!deadline) return 0;
  
  const now = new Date();
  const remaining = deadline.getTime() - now.getTime();
  
  return Math.max(0, Math.floor(remaining / 1000 / 60)); // minutes
}

/**
 * Format ETA time for display
 */
export function formatETA(etaMinutes: number): string {
  if (etaMinutes < 60) {
    return `${etaMinutes}m`;
  }
  
  const hours = Math.floor(etaMinutes / 60);
  const minutes = etaMinutes % 60;
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}m`;
}

/**
 * Format waiting time (time since check-in)
 */
export function formatWaitingTime(createdAt: string): string {
  const created = new Date(createdAt);
  const now = new Date();
  const waitingMinutes = Math.floor((now.getTime() - created.getTime()) / 1000 / 60);
  
  return formatETA(waitingMinutes);
}

// Test cases for ETA calculation
export const etaTestCases = [
  {
    name: 'Single ticket in queue',
    queue: [
      {
        id: '1',
        queuePosition: 1,
        procedure: { id: 'cleaning', duration: 30 },
        createdAt: new Date().toISOString(),
      },
    ],
    expected: { etaMinutes: 30, position: 1 },
  },
  {
    name: 'Multiple tickets same lane',
    queue: [
      {
        id: '1',
        queuePosition: 1,
        procedure: { id: 'cleaning', duration: 30 },
        dentist: { id: 'dr1' },
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        queuePosition: 2,
        procedure: { id: 'filling', duration: 45 },
        dentist: { id: 'dr1' },
        createdAt: new Date().toISOString(),
      },
    ],
    expected: [
      { etaMinutes: 30, position: 1 },
      { etaMinutes: 80, position: 2 }, // 30 + 5 turnover + 45
    ],
  },
  {
    name: 'Different lanes',
    queue: [
      {
        id: '1',
        queuePosition: 1,
        procedure: { duration: 30 },
        dentist: { id: 'dr1' },
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        queuePosition: 1,
        procedure: { duration: 45 },
        dentist: { id: 'dr2' },
        createdAt: new Date().toISOString(),
      },
    ],
    expected: [
      { etaMinutes: 30, position: 1 },
      { etaMinutes: 45, position: 1 },
    ],
  },
  {
    name: 'Emergency ticket SLA',
    queue: [
      {
        id: '1',
        queuePosition: 1,
        procedure: { duration: 20 },
        priority: 'emergency',
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 mins ago
      },
    ],
    slaRemaining: 5, // 15 min SLA - 10 min elapsed = 5 min remaining
  },
  {
    name: 'Unassigned ticket uses global average',
    queue: [
      {
        id: '1',
        queuePosition: 1,
        // No procedure specified
        createdAt: new Date().toISOString(),
      },
    ],
    globalAverageTime: 25,
    expected: { etaMinutes: 25, position: 1 },
  },
  {
    name: 'Custom procedure averages',
    queue: [
      {
        id: '1',
        queuePosition: 1,
        procedure: { id: 'root_canal' },
        createdAt: new Date().toISOString(),
      },
    ],
    averageProcedureTimes: { root_canal: 90 },
    expected: { etaMinutes: 90, position: 1 },
  },
] as const;