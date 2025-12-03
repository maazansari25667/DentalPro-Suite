import { QueryClient } from '@tanstack/react-query';
import { CreateCheckInRequest, QueueTicket, CheckIn, QueueStatus, Priority, Gender, VisitStatus } from './domain';
import { v4 as uuidv4 } from 'uuid';

// Mock socket events interface
interface SocketEvent {
  type: 'queue_updated' | 'check_in_created' | 'appointment_updated' | 'now_serving' | 'room_status_changed';
  data: any;
  timestamp: string;
}

let mockSocketInterval: NodeJS.Timeout | null = null;
let queryClientRef: QueryClient | null = null;

// Simulate walk-in patients
const walkInNames = [
  { firstName: 'Alex', lastName: 'Johnson', phone: '(555) 901-1111' },
  { firstName: 'Taylor', lastName: 'Smith', phone: '(555) 901-2222' },
  { firstName: 'Jordan', lastName: 'Brown', phone: '(555) 901-3333' },
  { firstName: 'Casey', lastName: 'Davis', phone: '(555) 901-4444' },
  { firstName: 'Riley', lastName: 'Wilson', phone: '(555) 901-5555' },
  { firstName: 'Morgan', lastName: 'Miller', phone: '(555) 901-6666' },
  { firstName: 'Avery', lastName: 'Garcia', phone: '(555) 901-7777' },
  { firstName: 'Sage', lastName: 'Martinez', phone: '(555) 901-8888' }
];

const urgentReasons = [
  'Severe tooth pain',
  'Broken tooth',
  'Lost filling',
  'Swollen gums',
  'Dental emergency',
  'Chipped tooth',
  'Jaw pain',
  'Bleeding gums'
];

const normalReasons = [
  'Routine cleaning',
  'Check-up',
  'Teeth whitening consultation',
  'Follow-up appointment',
  'Oral hygiene consultation'
];

// Generate random walk-in check-in
function generateRandomCheckIn(): CreateCheckInRequest {
  const patient = walkInNames[Math.floor(Math.random() * walkInNames.length)];
  const isUrgent = Math.random() < 0.3; // 30% chance of urgent case
  const priority = isUrgent 
    ? Math.random() < 0.5 ? Priority.URGENT : Priority.HIGH
    : Math.random() < 0.7 ? Priority.NORMAL : Priority.LOW;
  
  const reasons = isUrgent ? urgentReasons : normalReasons;
  const reason = reasons[Math.floor(Math.random() * reasons.length)];

  return {
    walkInPatient: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      phoneNumber: patient.phone,
      email: `${patient.firstName.toLowerCase()}.${patient.lastName.toLowerCase()}@email.com`,
      dateOfBirth: `${1970 + Math.floor(Math.random() * 40)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      gender: Math.random() < 0.5 ? Gender.FEMALE : Gender.MALE
    },
    priority,
    reasonForVisit: reason,
    symptoms: isUrgent ? `Patient reports ${reason.toLowerCase()} with significant discomfort` : undefined,
    isWalkIn: true
  };
}

// Simulate random queue events
async function simulateRandomEvent() {
  if (!queryClientRef) return;

  const eventType = Math.random();
  
  if (eventType < 0.4) {
    // 40% chance: Add new walk-in check-in
    await simulateWalkInCheckIn();
  } else if (eventType < 0.7) {
    // 30% chance: Mark a ticket as complete
    await simulateTicketCompletion();
  } else if (eventType < 0.9) {
    // 20% chance: Move ticket to in-treatment
    await simulateTicketStartTreatment();
  } else {
    // 10% chance: Call next patient
    await simulateNowServing();
  }
}

// Simulate walk-in check-in
async function simulateWalkInCheckIn() {
  try {
    const checkInData = generateRandomCheckIn();
    
    const response = await fetch('/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkInData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('🔄 Mock Socket: New walk-in check-in created:', result.data.patient.firstName, result.data.patient.lastName);
      
      // Invalidate relevant queries
      queryClientRef?.invalidateQueries({ queryKey: ['checkins'] });
      
      // Emit socket event
      emitSocketEvent({
        type: 'check_in_created',
        data: result.data,
        timestamp: new Date().toISOString()
      });

      // Automatically create queue ticket for high priority cases
      if (result.data.priority === Priority.URGENT || result.data.priority === Priority.EMERGENCY) {
        setTimeout(() => createQueueTicketForCheckIn(result.data), 2000);
      }
    }
  } catch (error) {
    console.error('Mock Socket: Failed to create walk-in check-in:', error);
  }
}

// Create queue ticket for check-in
async function createQueueTicketForCheckIn(checkIn: CheckIn) {
  try {
    const queueData = {
      checkInId: checkIn.id,
      priority: checkIn.priority,
      estimatedDuration: 30
    };

    const response = await fetch('/api/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queueData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('🎫 Mock Socket: Queue ticket created for:', checkIn.patient?.firstName || 'Unknown', checkIn.patient?.lastName || 'Patient');
      
      queryClientRef?.invalidateQueries({ queryKey: ['queue'] });
      
      emitSocketEvent({
        type: 'queue_updated',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Mock Socket: Failed to create queue ticket:', error);
  }
}

// Simulate ticket completion
async function simulateTicketCompletion() {
  try {
    const queueResponse = await fetch('/api/queue');
    if (!queueResponse.ok) return;

    const queueData = await queueResponse.json();
    const inTreatmentTickets = queueData.data.filter((ticket: QueueTicket) => 
      ticket.status === QueueStatus.IN_TREATMENT
    );

    if (inTreatmentTickets.length === 0) return;

    const ticketToComplete = inTreatmentTickets[Math.floor(Math.random() * inTreatmentTickets.length)];
    
    const response = await fetch(`/api/queue/${ticketToComplete.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: QueueStatus.COMPLETED })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Mock Socket: Treatment completed for:', ticketToComplete.patient.firstName, ticketToComplete.patient.lastName);
      
      queryClientRef?.invalidateQueries({ queryKey: ['queue'] });
      queryClientRef?.invalidateQueries({ queryKey: ['rooms'] });
      
      emitSocketEvent({
        type: 'queue_updated',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Mock Socket: Failed to complete ticket:', error);
  }
}

// Simulate starting treatment
async function simulateTicketStartTreatment() {
  try {
    const queueResponse = await fetch('/api/queue');
    if (!queueResponse.ok) return;

    const queueData = await queueResponse.json();
    const waitingTickets = queueData.data.filter((ticket: QueueTicket) => 
      ticket.status === QueueStatus.WAITING && ticket.dentist && ticket.room
    );

    if (waitingTickets.length === 0) return;

    const ticketToStart = waitingTickets[Math.floor(Math.random() * waitingTickets.length)];
    
    const response = await fetch(`/api/queue/${ticketToStart.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: QueueStatus.IN_TREATMENT })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('🏥 Mock Socket: Treatment started for:', ticketToStart.patient.firstName, ticketToStart.patient.lastName);
      
      queryClientRef?.invalidateQueries({ queryKey: ['queue'] });
      queryClientRef?.invalidateQueries({ queryKey: ['rooms'] });
      
      emitSocketEvent({
        type: 'queue_updated',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Mock Socket: Failed to start treatment:', error);
  }
}

// Simulate now serving alert
async function simulateNowServing() {
  try {
    const queueResponse = await fetch('/api/queue');
    if (!queueResponse.ok) return;

    const queueData = await queueResponse.json();
    const waitingTickets = queueData.data.filter((ticket: QueueTicket) => 
      ticket.status === QueueStatus.WAITING && ticket.dentist && ticket.room
    );

    if (waitingTickets.length === 0) return;

    // Pick highest priority ticket
    const ticketToCall = waitingTickets.sort((a: any, b: any) => {
      const priorityOrder: Record<string, number> = { emergency: 0, urgent: 1, high: 2, normal: 3, low: 4 };
      return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
    })[0];
    
    const response = await fetch('/api/alerts/now-serving', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ticketId: ticketToCall.id,
        soundAlert: true,
        displayDuration: 30
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('📢 Mock Socket: Now serving:', ticketToCall.ticketNumber, '-', ticketToCall.patient.firstName, ticketToCall.patient.lastName);
      
      queryClientRef?.invalidateQueries({ queryKey: ['queue'] });
      
      emitSocketEvent({
        type: 'now_serving',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Mock Socket: Failed to create now serving alert:', error);
  }
}

// Emit socket event (for potential real-time UI updates)
function emitSocketEvent(event: SocketEvent) {
  // In a real application, this would emit to a WebSocket or SSE connection
  // For now, we'll just trigger a custom event that components can listen to
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mockSocketEvent', { detail: event }));
  }
}

// Start the mock socket simulation
export function startMockSocket(queryClient: QueryClient) {
  if (mockSocketInterval) {
    console.warn('Mock socket is already running');
    return;
  }

  queryClientRef = queryClient;

  // Random interval between 15-30 seconds
  const getRandomInterval = () => 15000 + Math.random() * 15000;

  const scheduleNextEvent = () => {
    const interval = getRandomInterval();
    mockSocketInterval = setTimeout(() => {
      simulateRandomEvent().then(() => {
        scheduleNextEvent();
      });
    }, interval);
  };

  scheduleNextEvent();
  console.log('🔄 Mock Socket started - simulating real-time events every 15-30 seconds');
}

// Stop the mock socket simulation
export function stopMockSocket() {
  if (mockSocketInterval) {
    clearTimeout(mockSocketInterval);
    mockSocketInterval = null;
    queryClientRef = null;
    console.log('🛑 Mock Socket stopped');
  }
}

// Hook for components to listen to socket events
export function useMockSocketEvents(callback: (event: SocketEvent) => void) {
  if (typeof window !== 'undefined') {
    const handleEvent = (e: CustomEvent) => callback(e.detail);
    window.addEventListener('mockSocketEvent', handleEvent as EventListener);
    
    return () => {
      window.removeEventListener('mockSocketEvent', handleEvent as EventListener);
    };
  }
  return () => {};
}