import { describe, it, expect, beforeEach } from 'vitest';
import { 
  estimateEta, 
  calculateSLADeadline, 
  formatETA,
  EtaConfig,
  EtaResult 
} from '../eta';
import { QueueTicket, Priority } from '../domain';

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
    gender: 'male'
  },
  priority,
  status: status as any,
  ticketNumber: `T${id}`,
  estimatedDuration,
  queuePosition: 0, // Will be set by tests
  createdAt,
  updatedAt: createdAt,
});

const defaultConfig: EtaConfig = {
  turnoverTimeMinutes: 5,
  averageProcedureTimes: {
    'routine-cleaning': 30,
    'filling': 45,
    'extraction': 60,
    'emergency': 20,
  },
};

describe('ETA Calculation System', () => {
  let mockQueue: QueueTicket[];
  let targetTicket: QueueTicket;

  beforeEach(() => {
    // Reset test data
    const baseTime = '2025-11-12T10:00:00Z';
    
    mockQueue = [
      createMockTicket('1', 'waiting', 'routine', baseTime),
      createMockTicket('2', 'waiting', 'urgent', baseTime),
      createMockTicket('3', 'in_progress', 'emergency', baseTime, 20),
      createMockTicket('4', 'waiting', 'routine', baseTime),
      createMockTicket('5', 'waiting', 'emergency', baseTime, 15),
    ];

    targetTicket = createMockTicket('target', 'waiting', 'routine', baseTime);
    
    // Set queue positions
    mockQueue.forEach((ticket, index) => {
      ticket.queuePosition = index + 1;
    });
    targetTicket.queuePosition = mockQueue.length + 1;
  });

  describe('estimateEta', () => {
    it('should calculate basic ETA for routine ticket', () => {
      const result = estimateEta(targetTicket, mockQueue, defaultConfig);

      expect(result.estimatedWaitMinutes).toBeGreaterThan(0);
      expect(result.queuePosition).toBeGreaterThan(0);
      expect(result.estimatedServiceTime).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should prioritize emergency tickets', () => {
      const emergencyTicket = createMockTicket('emergency', 'waiting', 'emergency', '2025-11-12T10:00:00Z');
      emergencyTicket.queuePosition = 999; // Should be moved up

      const result = estimateEta(emergencyTicket, mockQueue, defaultConfig);

      // Emergency tickets should have shorter wait times despite queue position
      expect(result.queuePosition).toBeLessThan(emergencyTicket.queuePosition);
    });

    it('should handle empty queue', () => {
      const result = estimateEta(targetTicket, [], defaultConfig);

      expect(result.estimatedWaitMinutes).toBe(0);
      expect(result.queuePosition).toBe(1);
      expect(result.estimatedServiceTime).toBeDefined();
    });

    it('should account for in-progress tickets', () => {
      const inProgressTicket = mockQueue.find(t => t.status === 'in_progress');
      expect(inProgressTicket).toBeDefined();

      const result = estimateEta(targetTicket, mockQueue, defaultConfig);

      // Should account for remaining time of in-progress tickets
      expect(result.estimatedWaitMinutes).toBeGreaterThan(0);
    });

    it('should use procedure-specific durations', () => {
      const configWithProcedures = {
        ...defaultConfig,
        averageProcedureTimes: {
          'long-procedure': 120, // 2 hours
          'short-procedure': 15, // 15 minutes
        },
      };

      // Test with long procedure
      const longTicket = { ...targetTicket, procedure: { id: 'long-procedure' } as any };
      const longResult = estimateEta(longTicket, [], configWithProcedures);

      // Test with short procedure  
      const shortTicket = { ...targetTicket, procedure: { id: 'short-procedure' } as any };
      const shortResult = estimateEta(shortTicket, [], configWithProcedures);

      expect(longResult.estimatedServiceTime.getTime())
        .toBeGreaterThan(shortResult.estimatedServiceTime.getTime());
    });
  });

  describe('calculateSLADeadline', () => {
    it('should calculate emergency SLA (15 minutes)', () => {
      const emergencyTicket = createMockTicket('em1', 'waiting', 'emergency', '2025-11-12T10:00:00Z');
      const deadline = calculateSLADeadline(emergencyTicket);
      
      const expectedDeadline = new Date('2025-11-12T10:15:00Z');
      expect(deadline.getTime()).toBe(expectedDeadline.getTime());
    });

    it('should calculate urgent SLA (45 minutes)', () => {
      const urgentTicket = createMockTicket('ur1', 'waiting', 'urgent', '2025-11-12T10:00:00Z');
      const deadline = calculateSLADeadline(urgentTicket);
      
      const expectedDeadline = new Date('2025-11-12T10:45:00Z');
      expect(deadline.getTime()).toBe(expectedDeadline.getTime());
    });

    it('should calculate routine SLA (2 hours)', () => {
      const routineTicket = createMockTicket('ro1', 'waiting', 'routine', '2025-11-12T10:00:00Z');
      const deadline = calculateSLADeadline(routineTicket);
      
      const expectedDeadline = new Date('2025-11-12T12:00:00Z');
      expect(deadline.getTime()).toBe(expectedDeadline.getTime());
    });

    it('should handle completed tickets', () => {
      const completedTicket = createMockTicket('co1', 'completed', 'routine', '2025-11-12T10:00:00Z');
      const deadline = calculateSLADeadline(completedTicket);
      
      // Completed tickets should still return their original deadline
      expect(deadline).toBeDefined();
    });
  });

  describe('formatETA', () => {
    it('should format immediate service', () => {
      const now = new Date();
      const result = formatETA(now);
      
      expect(result).toBe('Now');
    });

    it('should format minutes correctly', () => {
      const now = new Date();
      const in15Min = new Date(now.getTime() + 15 * 60 * 1000);
      const result = formatETA(in15Min);
      
      expect(result).toBe('~15 min');
    });

    it('should format hours and minutes correctly', () => {
      const now = new Date();
      const in75Min = new Date(now.getTime() + 75 * 60 * 1000);
      const result = formatETA(in75Min);
      
      expect(result).toBe('~1h 15m');
    });

    it('should handle past times', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 30 * 60 * 1000);
      const result = formatETA(past);
      
      expect(result).toBe('Overdue');
    });

    it('should round to nearest 5 minutes', () => {
      const now = new Date();
      const in7Min = new Date(now.getTime() + 7 * 60 * 1000);
      const result = formatETA(in7Min);
      
      expect(result).toBe('~10 min'); // Should round 7 up to 10
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid ticket data gracefully', () => {
      const invalidTicket = { ...targetTicket, createdAt: 'invalid-date' };
      
      expect(() => {
        estimateEta(invalidTicket, mockQueue, defaultConfig);
      }).not.toThrow();
    });

    it('should handle missing procedure information', () => {
      const noProcedureTicket = { ...targetTicket, procedure: undefined };
      
      const result = estimateEta(noProcedureTicket, mockQueue, defaultConfig);
      
      expect(result).toBeDefined();
      expect(result.estimatedWaitMinutes).toBeGreaterThanOrEqual(0);
    });

    it('should handle extremely large queue', () => {
      const largeQueue = Array.from({ length: 1000 }, (_, i) => 
        createMockTicket(`large-${i}`, 'waiting', 'routine', '2025-11-12T10:00:00Z')
      );
      
      const result = estimateEta(targetTicket, largeQueue, defaultConfig);
      
      expect(result).toBeDefined();
      expect(result.confidence).toBeLessThan(1); // Should have lower confidence
    });

    it('should maintain reasonable performance', () => {
      const largeQueue = Array.from({ length: 500 }, (_, i) => 
        createMockTicket(`perf-${i}`, 'waiting', 'routine', '2025-11-12T10:00:00Z')
      );
      
      const startTime = Date.now();
      const result = estimateEta(targetTicket, largeQueue, defaultConfig);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      expect(result).toBeDefined();
    });
  });

  describe('Type Guards and Validation', () => {
    it('should validate Priority enum values', () => {
      const validPriorities: Priority[] = ['emergency', 'urgent', 'routine'];
      
      validPriorities.forEach(priority => {
        expect(['emergency', 'urgent', 'routine']).toContain(priority);
      });
    });

    it('should validate EtaResult structure', () => {
      const result = estimateEta(targetTicket, mockQueue, defaultConfig);
      
      expect(result).toMatchObject({
        estimatedWaitMinutes: expect.any(Number),
        estimatedServiceTime: expect.any(Date),
        queuePosition: expect.any(Number),
        slaDeadline: expect.any(Date),
        isUrgent: expect.any(Boolean),
        confidence: expect.any(Number),
      });
    });

    it('should validate queue position calculations', () => {
      const result = estimateEta(targetTicket, mockQueue, defaultConfig);
      
      // Queue position should be reasonable
      expect(result.queuePosition).toBeGreaterThan(0);
      expect(result.queuePosition).toBeLessThanOrEqual(mockQueue.length + 1);
    });
  });
});