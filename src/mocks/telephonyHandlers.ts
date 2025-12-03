/**
 * MSW handlers for telephony API endpoints
 * Provides mock data for call logs, voicemail, and analytics
 */

import { http, HttpResponse } from 'msw';
import { CallDirection, CallDisposition } from '@/lib/telephony/provider-adapter';

// Mock call log data
interface CallLog {
  id: string;
  callId: string;
  who: string;
  whoDisplay?: string;
  when: string;
  duration: number;
  direction: CallDirection;
  disposition: CallDisposition;
  notes?: string;
  patientId?: string;
  appointmentId?: string;
  dentistId?: string;
  ticketId?: string;
  recordingUrl?: string;
}

interface VoicemailMessage {
  id: string;
  from: string;
  fromDisplay?: string;
  when: string;
  duration: number;
  url?: string;
  transcript?: string;
  isRead: boolean;
  priority: 'normal' | 'urgent';
}

// Generate mock call logs
const generateMockCallLogs = (): CallLog[] => {
  const mockLogs: CallLog[] = [];
  const mockNumbers = [
    '+1234567890',
    '+1987654321',
    '+1555123456',
    '+1444987654',
    '+1333555777',
    '+1222999444',
    '+1666777888',
    '+1111333555'
  ];
  
  const dispositions: CallDisposition[] = [
    CallDisposition.REACHED,
    CallDisposition.NO_ANSWER,
    CallDisposition.LEFT_VM,
    CallDisposition.BUSY,
    CallDisposition.WRONG_NUMBER
  ];

  for (let i = 0; i < 50; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Last 30 days
    date.setHours(
      8 + Math.floor(Math.random() * 10), // 8 AM - 6 PM
      Math.floor(Math.random() * 60),
      Math.floor(Math.random() * 60)
    );

    const direction = Math.random() > 0.6 ? CallDirection.OUTBOUND : CallDirection.INBOUND;
    const duration = Math.floor(Math.random() * 1800); // 0-30 minutes
    const disposition = dispositions[Math.floor(Math.random() * dispositions.length)];
    
    mockLogs.push({
      id: `log_${i + 1}`,
      callId: `call_${Date.now()}_${i}`,
      who: mockNumbers[Math.floor(Math.random() * mockNumbers.length)],
      whoDisplay: Math.random() > 0.3 ? `Contact ${i + 1}` : undefined,
      when: date.toISOString(),
      duration,
      direction,
      disposition,
      notes: Math.random() > 0.7 ? `Call notes for log ${i + 1}` : undefined,
      patientId: Math.random() > 0.5 ? `patient_${Math.floor(Math.random() * 20)}` : undefined,
      appointmentId: Math.random() > 0.7 ? `apt_${Math.floor(Math.random() * 10)}` : undefined,
      dentistId: Math.random() > 0.8 ? `dentist_${Math.floor(Math.random() * 5)}` : undefined,
      recordingUrl: Math.random() > 0.8 ? `/recordings/call_${i + 1}.mp3` : undefined,
    });
  }

  return mockLogs.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());
};

// Generate mock voicemail messages
const generateMockVoicemail = (): VoicemailMessage[] => {
  const mockMessages: VoicemailMessage[] = [];
  const mockNumbers = [
    '+1234567890',
    '+1987654321',
    '+1555123456'
  ];

  for (let i = 0; i < 8; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 7)); // Last week
    date.setHours(
      8 + Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 60),
      Math.floor(Math.random() * 60)
    );

    mockMessages.push({
      id: `vm_${i + 1}`,
      from: mockNumbers[Math.floor(Math.random() * mockNumbers.length)],
      fromDisplay: Math.random() > 0.3 ? `Patient ${i + 1}` : undefined,
      when: date.toISOString(),
      duration: 30 + Math.floor(Math.random() * 120), // 30 seconds to 2.5 minutes
      url: `data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjQwLjEwMQAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA`,
      transcript: Math.random() > 0.5 ? `Hi, this is a voicemail message ${i + 1}. Please call me back when you get a chance. Thank you!` : undefined,
      isRead: Math.random() > 0.3,
      priority: Math.random() > 0.8 ? 'urgent' : 'normal'
    });
  }

  return mockMessages.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());
};

let mockCallLogs = generateMockCallLogs();
let mockVoicemail = generateMockVoicemail();

export const telephonyHandlers = [
  // Get call logs with filtering and pagination
  http.get('/api/telephony/logs', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const direction = url.searchParams.get('direction') as CallDirection | null;
    const disposition = url.searchParams.get('disposition') as CallDisposition | null;
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const patientId = url.searchParams.get('patientId');
    const dentistId = url.searchParams.get('dentistId');

    let filteredLogs = [...mockCallLogs];

    // Apply filters
    if (query) {
      filteredLogs = filteredLogs.filter(log => 
        log.who.includes(query) ||
        log.whoDisplay?.toLowerCase().includes(query.toLowerCase()) ||
        log.notes?.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (from) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.when) >= new Date(from)
      );
    }

    if (to) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.when) <= new Date(to)
      );
    }

    if (direction) {
      filteredLogs = filteredLogs.filter(log => log.direction === direction);
    }

    if (disposition) {
      filteredLogs = filteredLogs.filter(log => log.disposition === disposition);
    }

    if (patientId) {
      filteredLogs = filteredLogs.filter(log => log.patientId === patientId);
    }

    if (dentistId) {
      filteredLogs = filteredLogs.filter(log => log.dentistId === dentistId);
    }

    // Pagination
    const totalCount = filteredLogs.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: paginatedLogs,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: endIndex < totalCount,
        hasPrev: page > 1
      }
    });
  }),

  // Create or update call log entry
  http.post('/api/telephony/logs', async ({ request }) => {
    const body = await request.json() as Partial<CallLog>;
    
    const newLog: CallLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      callId: body.callId || `call_${Date.now()}`,
      who: body.who || '',
      whoDisplay: body.whoDisplay,
      when: body.when || new Date().toISOString(),
      duration: body.duration || 0,
      direction: body.direction || CallDirection.OUTBOUND,
      disposition: body.disposition || CallDisposition.OTHER,
      notes: body.notes,
      patientId: body.patientId,
      appointmentId: body.appointmentId,
      dentistId: body.dentistId,
      ticketId: body.ticketId,
      recordingUrl: body.recordingUrl
    };

    // Check if updating existing log
    const existingIndex = mockCallLogs.findIndex(log => log.callId === newLog.callId);
    if (existingIndex >= 0) {
      mockCallLogs[existingIndex] = { ...mockCallLogs[existingIndex], ...newLog };
      return HttpResponse.json({
        success: true,
        data: mockCallLogs[existingIndex]
      });
    }

    // Add new log
    mockCallLogs.unshift(newLog);
    
    return HttpResponse.json({
      success: true,
      data: newLog
    }, { status: 201 });
  }),

  // Get specific call log
  http.get('/api/telephony/logs/:id', ({ params }) => {
    const { id } = params;
    const log = mockCallLogs.find(l => l.id === id);
    
    if (!log) {
      return HttpResponse.json({
        success: false,
        error: 'Call log not found'
      }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      data: log
    });
  }),

  // Update call log
  http.patch('/api/telephony/logs/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json() as Partial<CallLog>;
    
    const logIndex = mockCallLogs.findIndex(l => l.id === id);
    if (logIndex === -1) {
      return HttpResponse.json({
        success: false,
        error: 'Call log not found'
      }, { status: 404 });
    }

    mockCallLogs[logIndex] = { ...mockCallLogs[logIndex], ...updates };
    
    return HttpResponse.json({
      success: true,
      data: mockCallLogs[logIndex]
    });
  }),

  // Delete call log
  http.delete('/api/telephony/logs/:id', ({ params }) => {
    const { id } = params;
    const logIndex = mockCallLogs.findIndex(l => l.id === id);
    
    if (logIndex === -1) {
      return HttpResponse.json({
        success: false,
        error: 'Call log not found'
      }, { status: 404 });
    }

    mockCallLogs.splice(logIndex, 1);
    
    return HttpResponse.json({
      success: true,
      message: 'Call log deleted'
    });
  }),

  // Get voicemail messages
  http.get('/api/telephony/voicemail', ({ request }) => {
    const url = new URL(request.url);
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    let filteredMessages = [...mockVoicemail];
    
    if (unreadOnly) {
      filteredMessages = filteredMessages.filter(msg => !msg.isRead);
    }

    // Pagination
    const totalCount = filteredMessages.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMessages = filteredMessages.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: paginatedMessages,
      meta: {
        total: totalCount,
        unreadCount: mockVoicemail.filter(m => !m.isRead).length,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: endIndex < totalCount,
        hasPrev: page > 1
      }
    });
  }),

  // Mark voicemail as read/unread
  http.patch('/api/telephony/voicemail/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json() as Partial<VoicemailMessage>;
    
    const messageIndex = mockVoicemail.findIndex(m => m.id === id);
    if (messageIndex === -1) {
      return HttpResponse.json({
        success: false,
        error: 'Voicemail message not found'
      }, { status: 404 });
    }

    mockVoicemail[messageIndex] = { ...mockVoicemail[messageIndex], ...updates };
    
    return HttpResponse.json({
      success: true,
      data: mockVoicemail[messageIndex]
    });
  }),

  // Delete voicemail message
  http.delete('/api/telephony/voicemail/:id', ({ params }) => {
    const { id } = params;
    const messageIndex = mockVoicemail.findIndex(m => m.id === id);
    
    if (messageIndex === -1) {
      return HttpResponse.json({
        success: false,
        error: 'Voicemail message not found'
      }, { status: 404 });
    }

    mockVoicemail.splice(messageIndex, 1);
    
    return HttpResponse.json({
      success: true,
      message: 'Voicemail message deleted'
    });
  }),

  // Get call analytics/statistics
  http.get('/api/telephony/analytics', ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const dentistId = url.searchParams.get('dentistId');

    let filteredLogs = [...mockCallLogs];

    if (from) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.when) >= new Date(from)
      );
    }

    if (to) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.when) <= new Date(to)
      );
    }

    if (dentistId) {
      filteredLogs = filteredLogs.filter(log => log.dentistId === dentistId);
    }

    // Calculate statistics
    const totalCalls = filteredLogs.length;
    const inboundCalls = filteredLogs.filter(l => l.direction === CallDirection.INBOUND).length;
    const outboundCalls = filteredLogs.filter(l => l.direction === CallDirection.OUTBOUND).length;
    const answeredCalls = filteredLogs.filter(l => l.disposition === CallDisposition.REACHED).length;
    const missedCalls = filteredLogs.filter(l => l.disposition === CallDisposition.NO_ANSWER).length;
    const totalDuration = filteredLogs.reduce((sum, log) => sum + log.duration, 0);
    const avgDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;

    // Call volume by hour
    const callsByHour = new Array(24).fill(0);
    filteredLogs.forEach(log => {
      const hour = new Date(log.when).getHours();
      callsByHour[hour]++;
    });

    // Call disposition breakdown
    const dispositionBreakdown = {
      [CallDisposition.REACHED]: filteredLogs.filter(l => l.disposition === CallDisposition.REACHED).length,
      [CallDisposition.NO_ANSWER]: filteredLogs.filter(l => l.disposition === CallDisposition.NO_ANSWER).length,
      [CallDisposition.LEFT_VM]: filteredLogs.filter(l => l.disposition === CallDisposition.LEFT_VM).length,
      [CallDisposition.BUSY]: filteredLogs.filter(l => l.disposition === CallDisposition.BUSY).length,
      [CallDisposition.WRONG_NUMBER]: filteredLogs.filter(l => l.disposition === CallDisposition.WRONG_NUMBER).length,
      [CallDisposition.OTHER]: filteredLogs.filter(l => l.disposition === CallDisposition.OTHER).length,
    };

    return HttpResponse.json({
      success: true,
      data: {
        summary: {
          totalCalls,
          inboundCalls,
          outboundCalls,
          answeredCalls,
          missedCalls,
          totalDuration,
          avgDuration,
          answerRate: totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 100) : 0
        },
        callsByHour,
        dispositionBreakdown,
        topCallers: filteredLogs
          .reduce((acc, log) => {
            const existing = acc.find(item => item.number === log.who);
            if (existing) {
              existing.count++;
              existing.duration += log.duration;
            } else {
              acc.push({
                number: log.who,
                display: log.whoDisplay,
                count: 1,
                duration: log.duration
              });
            }
            return acc;
          }, [] as Array<{ number: string; display?: string; count: number; duration: number }>)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      }
    });
  }),
];