/**
 * @jest-environment jsdom
 */

import { 
  estimateEta, 
  calculateSLADeadline, 
  formatETA,
  ETACalculationParams,
  ETAResult 
} from '../eta';
import { QueueTicket, Priority, Gender } from '../domain';

// Mock queue tickets for testing
const createMockTicket = (
  id: string,
  status: string,
  priority: Priority,
  createdAt: string,
  estimatedDuration = 30
): QueueTicket => ({
  id,
  checkInId: `checkin-${id}`,
  patient: {
    id: `patient-${id}`,
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '555-0123',
    dateOfBirth: '1990-01-01',
    gender: Gender.MALE
  },
  priority,
  status: status as any,
  ticketNumber: `T${id}`,
  estimatedDuration,
  queuePosition: 0,
  createdAt,
  updatedAt: createdAt,
});

describe('ETA Calculation System', () => {
  let mockQueue: QueueTicket[];
  let etaParams: ETACalculationParams;

  beforeEach(() => {
    const baseTime = '2025-11-12T10:00:00Z';
    
    mockQueue = [
      createMockTicket('1', 'waiting', Priority.ROUTINE, baseTime),
      createMockTicket('2', 'waiting', Priority.URGENT, baseTime),
      createMockTicket('3', 'in_progress', Priority.EMERGENCY, baseTime, 20),
      createMockTicket('4', 'waiting', Priority.ROUTINE, baseTime),
    ];

    // Set queue positions
    mockQueue.forEach((ticket, index) => {
      ticket.queuePosition = index + 1;
    });

    etaParams = {
      queue: mockQueue,
      averageProcedureTimes: {
        'routine-cleaning': 30,
        'filling': 45,
        'extraction': 60,
        'emergency': 20,
      },
      turnoverTime: 5,
      globalAverageTime: 30,
    };
  });

  test('calculates ETAs for all tickets in queue', () => {
    const results = estimateEta(etaParams);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(mockQueue.length);
    
    results.forEach(result => {
      expect(result).toMatchObject({
        ticketId: expect.any(String),
        etaMinutes: expect.any(Number),
        estimatedCompletionTime: expect.any(Date),
        position: expect.any(Number),
      });
      expect(result.etaMinutes).toBeGreaterThanOrEqual(0);
    });
  });

  test('handles empty queue', () => {
    const emptyParams = { ...etaParams, queue: [] };
    const results = estimateEta(emptyParams);

    expect(results).toEqual([]);
  });

  test('calculates emergency SLA deadline correctly', () => {
    const emergencyTicket = createMockTicket('em1', 'waiting', Priority.EMERGENCY, '2025-11-12T10:00:00Z');
    const deadline = calculateSLADeadline(emergencyTicket);
    
    const expectedDeadline = new Date('2025-11-12T10:15:00Z');
    expect(deadline.getTime()).toBe(expectedDeadline.getTime());
  });

  test('calculates urgent SLA deadline correctly', () => {
    const urgentTicket = createMockTicket('ur1', 'waiting', Priority.URGENT, '2025-11-12T10:00:00Z');
    const deadline = calculateSLADeadline(urgentTicket);
    
    const expectedDeadline = new Date('2025-11-12T10:45:00Z');
    expect(deadline.getTime()).toBe(expectedDeadline.getTime());
  });

  test('calculates routine SLA deadline correctly', () => {
    const routineTicket = createMockTicket('ro1', 'waiting', Priority.ROUTINE, '2025-11-12T10:00:00Z');
    const deadline = calculateSLADeadline(routineTicket);
    
    const expectedDeadline = new Date('2025-11-12T12:00:00Z');
    expect(deadline.getTime()).toBe(expectedDeadline.getTime());
  });

  test('formats ETA for immediate service', () => {
    const now = new Date();
    const result = formatETA(now);
    
    expect(result).toBe('Now');
  });

  test('formats ETA minutes correctly', () => {
    const now = new Date();
    const in15Min = new Date(now.getTime() + 15 * 60 * 1000);
    const result = formatETA(in15Min);
    
    expect(result).toBe('~15 min');
  });

  test('formats ETA hours and minutes correctly', () => {
    const now = new Date();
    const in75Min = new Date(now.getTime() + 75 * 60 * 1000);
    const result = formatETA(in75Min);
    
    expect(result).toBe('~1h 15m');
  });

  test('handles overdue times', () => {
    const now = new Date();
    const past = new Date(now.getTime() - 30 * 60 * 1000);
    const result = formatETA(past);
    
    expect(result).toBe('Overdue');
  });

  test('handles large queue efficiently', () => {
    const largeQueue = Array.from({ length: 100 }, (_, i) => 
      createMockTicket(`large-${i}`, 'waiting', Priority.ROUTINE, '2025-11-12T10:00:00Z')
    );
    
    const largeParams = { ...etaParams, queue: largeQueue };
    
    const startTime = Date.now();
    const results = estimateEta(largeParams);
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    expect(results.length).toBe(100);
  });

  test('validates Priority enum values', () => {
    const validPriorities = [Priority.EMERGENCY, Priority.URGENT, Priority.ROUTINE];
    
    validPriorities.forEach(priority => {
      expect(Object.values(Priority)).toContain(priority);
    });
  });
});