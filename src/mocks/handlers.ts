import { http, HttpResponse } from 'msw';
import { 
  mockDentists, 
  mockRooms, 
  mockProcedures, 
  generateTodayAppointments,
  generateCurrentCheckIns,
  generateQueueTickets,
  mockDentistsList,
  mockProceduresList,
  generateTodaysAppointments
} from './fixtures';
import { telephonyHandlers } from './telephonyHandlers';
import { 
  CreateCheckInRequest, 
  CreateQueueTicketRequest, 
  UpdateQueueTicketRequest,
  NowServingRequest,
  CheckIn,
  QueueTicket,
  VisitStatus,
  QueueStatus,
  Priority,
  PatientRef
} from '@/lib/domain';
import { v4 as uuidv4 } from 'uuid';

// In-memory data stores
let appointments = generateTodayAppointments();
let checkIns = generateCurrentCheckIns();
let queueTickets = generateQueueTickets();
let nowServingEvents: any[] = []; // Store for now-serving events

export const handlers = [
  // GET /api/dentists
  http.get('/api/dentists', () => {
    return HttpResponse.json({
      success: true,
      data: mockDentists,
      total: mockDentists.length
    });
  }),

  // GET /api/rooms
  http.get('/api/rooms', () => {
    return HttpResponse.json({
      success: true,
      data: mockRooms,
      total: mockRooms.length
    });
  }),

  // GET /api/procedures
  http.get('/api/procedures', () => {
    return HttpResponse.json({
      success: true,
      data: mockProcedures,
      total: mockProcedures.length
    });
  }),

  // GET /api/appointments?date=YYYY-MM-DD
  http.get('/api/appointments', ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const today = new Date().toISOString().split('T')[0];
    
    // Filter appointments by date (default to today)
    const filteredAppointments = appointments.filter(apt =>
      apt.scheduledStart.startsWith(date || today)
    );    return HttpResponse.json({
      success: true,
      data: filteredAppointments,
      total: filteredAppointments.length,
      date: date || today
    });
  }),

  // GET /api/checkins?date=YYYY-MM-DD
  http.get('/api/checkins', ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const today = new Date().toISOString().split('T')[0];
    
    // Filter check-ins by date (default to today)
    const filteredCheckIns = checkIns.filter(checkIn => {
      const checkInDate = new Date(checkIn.checkInTime).toISOString().split('T')[0];
      return checkInDate === (date || today);
    });

    return HttpResponse.json({
      success: true,
      data: filteredCheckIns,
      total: filteredCheckIns.length,
      date: date || today
    });
  }),

  // POST /api/checkins
  http.post('/api/checkins', async ({ request }) => {
    try {
      const body = await request.json() as CreateCheckInRequest;
      
      const newCheckIn: CheckIn = {
        id: uuidv4(),
        appointmentId: body.patientId ? undefined : undefined, // Could link to existing appointment
        patient: body.walkInPatient ? {
          id: uuidv4(),
          ...body.walkInPatient,
          email: body.walkInPatient.email
        } : {
          id: body.patientId!,
          firstName: 'Unknown',
          lastName: 'Patient',
          phoneNumber: '(555) 000-0000',
          dateOfBirth: '1990-01-01',
          gender: 'other' as any
        },
        checkInTime: new Date().toISOString(),
        priority: body.priority,
        reasonForVisit: body.reasonForVisit,
        isWalkIn: body.isWalkIn,
        symptoms: body.symptoms,
        vitalSigns: {
          bloodPressure: '120/80',
          temperature: 98.6,
          heartRate: 75
        },
        insuranceVerified: false,
        consentSigned: false,
        status: VisitStatus.CHECKED_IN,
        estimatedWaitTime: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      checkIns.push(newCheckIn);

      return HttpResponse.json({
        success: true,
        data: newCheckIn,
        message: 'Check-in created successfully'
      }, { status: 201 });
    } catch (error) {
      return HttpResponse.json({
        success: false,
        error: 'Invalid request data',
        message: 'Failed to create check-in'
      }, { status: 400 });
    }
  }),

  // GET /api/queue
  http.get('/api/queue', () => {
    // Sort by priority and creation time
    const sortedTickets = [...queueTickets].sort((a, b) => {
      const priorityOrder = {
        [Priority.EMERGENCY]: 0,
        [Priority.URGENT]: 1,
        [Priority.HIGH]: 2,
        [Priority.NORMAL]: 3,
        [Priority.LOW]: 4
      };
      
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return HttpResponse.json({
      success: true,
      data: sortedTickets,
      total: sortedTickets.length,
      stats: {
        waiting: sortedTickets.filter(t => t.status === QueueStatus.WAITING).length,
        inTreatment: sortedTickets.filter(t => t.status === QueueStatus.IN_TREATMENT).length,
        urgent: sortedTickets.filter(t => t.priority === Priority.URGENT || t.priority === Priority.EMERGENCY).length
      }
    });
  }),

  // POST /api/queue
  http.post('/api/queue', async ({ request }) => {
    try {
      const body = await request.json() as CreateQueueTicketRequest;
      
      const checkIn = checkIns.find(c => c.id === body.checkInId);
      if (!checkIn) {
        return HttpResponse.json({
          success: false,
          error: 'Check-in not found',
          message: 'Cannot create queue ticket for non-existent check-in'
        }, { status: 404 });
      }

      const dentist = body.dentistId ? mockDentists.find(d => d.id === body.dentistId) : undefined;
      const room = body.roomId ? mockRooms.find(r => r.id === body.roomId) : undefined;
      const procedure = body.procedureId ? mockProcedures.find(p => p.id === body.procedureId) : undefined;

      const newTicket: QueueTicket = {
        id: uuidv4(),
        checkInId: body.checkInId,
        patient: checkIn.patient || checkIn.walkInPatient!,
        dentist,
        room,
        procedure,
        priority: body.priority,
        status: QueueStatus.WAITING,
        ticketNumber: `T${String(queueTickets.length + 1).padStart(3, '0')}`,
        estimatedDuration: body.estimatedDuration || procedure?.duration,
        queuePosition: queueTickets.filter(t => t.status === QueueStatus.WAITING).length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      queueTickets.push(newTicket);

      return HttpResponse.json({
        success: true,
        data: newTicket,
        message: 'Queue ticket created successfully'
      }, { status: 201 });
    } catch (error) {
      return HttpResponse.json({
        success: false,
        error: 'Invalid request data',
        message: 'Failed to create queue ticket'
      }, { status: 400 });
    }
  }),

  // PATCH /api/queue/:id
  http.patch('/api/queue/:id', async ({ request, params }) => {
    try {
      const ticketId = params.id as string;
      const body = await request.json() as UpdateQueueTicketRequest;
      
      const ticketIndex = queueTickets.findIndex(t => t.id === ticketId);
      if (ticketIndex === -1) {
        return HttpResponse.json({
          success: false,
          error: 'Ticket not found',
          message: 'Queue ticket not found'
        }, { status: 404 });
      }

      const ticket = queueTickets[ticketIndex];
      const dentist = body.dentistId ? mockDentists.find(d => d.id === body.dentistId) : ticket.dentist;
      const room = body.roomId ? mockRooms.find(r => r.id === body.roomId) : ticket.room;
      const procedure = body.procedureId ? mockProcedures.find(p => p.id === body.procedureId) : ticket.procedure;

      const updatedTicket: QueueTicket = {
        ...ticket,
        dentist,
        room,
        procedure,
        priority: body.priority || ticket.priority,
        status: body.status || ticket.status,
        queuePosition: body.queuePosition || ticket.queuePosition,
        actualStartTime: body.status === QueueStatus.IN_TREATMENT ? new Date().toISOString() : ticket.actualStartTime,
        actualEndTime: body.status === QueueStatus.COMPLETED ? new Date().toISOString() : ticket.actualEndTime,
        updatedAt: new Date().toISOString()
      };

      queueTickets[ticketIndex] = updatedTicket;

      return HttpResponse.json({
        success: true,
        data: updatedTicket,
        message: 'Queue ticket updated successfully'
      });
    } catch (error) {
      return HttpResponse.json({
        success: false,
        error: 'Invalid request data',
        message: 'Failed to update queue ticket'
      }, { status: 400 });
    }
  }),

  // DELETE /api/queue/:id
  http.delete('/api/queue/:id', ({ params }) => {
    const ticketId = params.id as string;
    
    const ticketIndex = queueTickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) {
      return HttpResponse.json({
        success: false,
        error: 'Ticket not found',
        message: 'Queue ticket not found'
      }, { status: 404 });
    }

    const deletedTicket = queueTickets.splice(ticketIndex, 1)[0];

    return HttpResponse.json({
      success: true,
      data: deletedTicket,
      message: 'Queue ticket deleted successfully'
    });
  }),

  // GET /api/alerts/now-serving
  http.get('/api/alerts/now-serving', () => {
    // Return the last 3 events, sorted by creation time (newest first)
    const recentEvents = nowServingEvents
      .sort((a, b) => new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime())
      .slice(0, 3);

    return HttpResponse.json({
      success: true,
      data: recentEvents,
      total: recentEvents.length
    });
  }),

  // POST /api/alerts/now-serving
  http.post('/api/alerts/now-serving', async ({ request }) => {
    try {
      const body = await request.json() as NowServingRequest;
      
      const ticket = queueTickets.find(t => t.id === body.ticketId);
      if (!ticket) {
        return HttpResponse.json({
          success: false,
          error: 'Ticket not found',
          message: 'Queue ticket not found'
        }, { status: 404 });
      }

      // Update ticket status to called
      const ticketIndex = queueTickets.findIndex(t => t.id === body.ticketId);
      queueTickets[ticketIndex] = {
        ...ticket,
        status: QueueStatus.CALLED,
        updatedAt: new Date().toISOString()
      };

      const nowServing = {
        id: uuidv4(),
        ticketNumber: ticket.ticketNumber,
        patient: ticket.patient,
        dentist: ticket.dentist!,
        room: ticket.room!,
        calledAt: new Date().toISOString(),
        displayDuration: body.displayDuration || 30,
        soundAlert: body.soundAlert !== false,
        displayMessage: body.displayMessage || `${ticket.patient.firstName} ${ticket.patient.lastName}, please proceed to ${ticket.room?.name}`
      };

      // Add to now serving events store
      nowServingEvents.unshift(nowServing);

      // Keep only last 10 events
      if (nowServingEvents.length > 10) {
        nowServingEvents = nowServingEvents.slice(0, 10);
      }

      return HttpResponse.json({
        success: true,
        data: nowServing,
        message: 'Now serving alert created'
      });
    } catch (error) {
      return HttpResponse.json({
        success: false,
        error: 'Invalid request data',
        message: 'Failed to create now serving alert'
      }, { status: 400 });
    }
  }),

  // ===== CLINICAL MODULES HANDLERS =====

  // ===== APPOINTMENTS ENDPOINTS =====
  
  // GET /api/appointments - List appointments with filters
  http.get('/api/appointments', ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const dentistId = url.searchParams.get('dentistId');
    const roomId = url.searchParams.get('roomId');
    const status = url.searchParams.get('status');
    const q = url.searchParams.get('q'); // search query

    let filteredAppointments = [...mockAppointmentsList];

    // Apply filters
    if (from) {
      filteredAppointments = filteredAppointments.filter(apt => 
        apt.scheduledStart >= from
      );
    }

    if (to) {
      filteredAppointments = filteredAppointments.filter(apt => 
        apt.scheduledStart <= to
      );
    }

    if (dentistId) {
      filteredAppointments = filteredAppointments.filter(apt => 
        apt.dentist.id === dentistId
      );
    }

    if (roomId) {
      filteredAppointments = filteredAppointments.filter(apt => 
        apt.room?.id === roomId
      );
    }

    if (status) {
      filteredAppointments = filteredAppointments.filter(apt => 
        apt.status === status
      );
    }

    if (q) {
      const searchLower = q.toLowerCase();
      filteredAppointments = filteredAppointments.filter(apt => 
        apt.patient.firstName.toLowerCase().includes(searchLower) ||
        apt.patient.lastName.toLowerCase().includes(searchLower) ||
        apt.dentist.name.toLowerCase().includes(searchLower) ||
        apt.procedure.name.toLowerCase().includes(searchLower)
      );
    }

    return HttpResponse.json({
      success: true,
      data: filteredAppointments,
      total: filteredAppointments.length
    });
  }),

  // GET /api/appointments/:id - Get single appointment
  http.get('/api/appointments/:id', ({ params }) => {
    const appointment = mockAppointmentsList.find(a => a.id === params.id);
    
    if (!appointment) {
      return HttpResponse.json({
        success: false,
        error: 'Appointment not found'
      }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      data: appointment
    });
  }),

  // POST /api/appointments - Create appointment with conflict detection
  http.post('/api/appointments', async ({ request }) => {
    try {
      const appointmentData = await request.json() as any;
      
      // Validate required fields
      if (!appointmentData || !appointmentData.scheduledStart || !appointmentData.scheduledMinutes || !appointmentData.dentistId) {
        return HttpResponse.json({
          success: false,
          error: 'Missing required appointment data'
        }, { status: 400 });
      }
      
      // Check for conflicts
      const conflicts = mockAppointmentsList.filter(existing => {
        if (existing.status === 'cancelled' || existing.status === 'no_show') {
          return false;
        }
        
        const existingStart = new Date(existing.scheduledStart);
        const existingEnd = new Date(existingStart.getTime() + existing.scheduledMinutes * 60000);
        const newStart = new Date(appointmentData.scheduledStart);
        const newEnd = new Date(newStart.getTime() + appointmentData.scheduledMinutes * 60000);
        
        // Check dentist conflict
        const dentistConflict = existing.dentist.id === appointmentData.dentistId &&
          ((newStart >= existingStart && newStart < existingEnd) ||
           (newEnd > existingStart && newEnd <= existingEnd) ||
           (newStart <= existingStart && newEnd >= existingEnd));
           
        // Check room conflict  
        const roomConflict = appointmentData.roomId && existing.room?.id === appointmentData.roomId &&
          ((newStart >= existingStart && newStart < existingEnd) ||
           (newEnd > existingStart && newEnd <= existingEnd) ||
           (newStart <= existingStart && newEnd >= existingEnd));
           
        return dentistConflict || roomConflict;
      });

      if (conflicts.length > 0) {
        return HttpResponse.json({
          success: false,
          conflict: true,
          overlapsWith: conflicts.map(c => ({
            id: c.id,
            dentist: c.dentist.name,
            patient: `${c.patient.firstName} ${c.patient.lastName}`,
            scheduledStart: c.scheduledStart,
            scheduledMinutes: c.scheduledMinutes,
            room: c.room?.name
          }))
        }, { status: 409 });
      }

      // Find dentist and procedure
      const dentist = mockDentistsList.find(d => d.id === appointmentData.dentistId);
      const procedure = mockProceduresList.find(p => p.code === appointmentData.procedureCode);
      const patient = mockPatients.find(p => p.id === appointmentData.patientId);
      const room = appointmentData.roomId ? mockRooms.find(r => r.id === appointmentData.roomId) : undefined;

      if (!dentist || !procedure || !patient) {
        return HttpResponse.json({
          success: false,
          error: 'Invalid dentist, procedure, or patient ID'
        }, { status: 400 });
      }

      const newAppointment = {
        id: uuidv4(),
        patient,
        dentist,
        room,
        procedure,
        scheduledStart: appointmentData.scheduledStart,
        scheduledMinutes: appointmentData.scheduledMinutes,
        status: 'scheduled' as const,
        priority: Priority.NORMAL,
        notes: appointmentData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockAppointmentsList.push(newAppointment);

      return HttpResponse.json({
        success: true,
        data: newAppointment
      }, { status: 201 });
    } catch (error) {
      return HttpResponse.json({
        success: false,
        error: 'Invalid request data'
      }, { status: 400 });
    }
  }),

  // PATCH /api/appointments/:id - Update appointment
  http.patch('/api/appointments/:id', async ({ params, request }) => {
    try {
      const appointmentIndex = mockAppointmentsList.findIndex(a => a.id === params.id);
      if (appointmentIndex === -1) {
        return HttpResponse.json({
          success: false,
          error: 'Appointment not found'
        }, { status: 404 });
      }

      const updateData = await request.json() as any;
      const currentAppointment = mockAppointmentsList[appointmentIndex];
      
      if (!updateData) {
        return HttpResponse.json({
          success: false,
          error: 'No update data provided'
        }, { status: 400 });
      }
      
      // Handle status change to checked_in - create queue ticket
      if (updateData.status === 'checked_in' && currentAppointment.status !== 'checked_in') {
        const dentist = currentAppointment.dentist;
        const nameParts = dentist.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const procedure = currentAppointment.procedure;
        
        const newQueueTicket = {
          id: uuidv4(),
          checkInId: uuidv4(), // Create virtual check-in
          patient: currentAppointment.patient,
          dentist: {
            id: dentist.id,
            firstName: firstName,
            lastName: lastName,
            specialization: dentist.specialties[0] || 'General',
            licenseNumber: dentist.licenseNumber || '',
            phoneNumber: dentist.phone || '',
            email: dentist.email || '',
            isActive: dentist.active
          },
          room: currentAppointment.room,
          procedure: {
            id: procedure.code,
            name: procedure.name,
            code: procedure.code,
            description: procedure.description || '',
            duration: procedure.defaultMinutes,
            price: procedure.price,
            category: procedure.category || '',
            requiresAnesthesia: procedure.category === 'Surgery',
            followUpRequired: procedure.category === 'Surgery' || procedure.category === 'Endodontics'
          },
          priority: currentAppointment.priority,
          status: QueueStatus.WAITING,
          ticketNumber: `T${String(queueTickets.length + 1).padStart(3, '0')}`,
          estimatedDuration: currentAppointment.scheduledMinutes,
          queuePosition: queueTickets.length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        queueTickets.push(newQueueTicket);
      }

      // Update appointment
      const updatedAppointment = {
        ...currentAppointment,
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      mockAppointmentsList[appointmentIndex] = updatedAppointment;

      return HttpResponse.json({
        success: true,
        data: updatedAppointment
      });
    } catch (error) {
      return HttpResponse.json({
        success: false,
        error: 'Invalid request data'
      }, { status: 400 });
    }
  }),

  // DELETE /api/appointments/:id
  http.delete('/api/appointments/:id', ({ params }) => {
    const appointmentIndex = mockAppointmentsList.findIndex(a => a.id === params.id);
    if (appointmentIndex === -1) {
      return HttpResponse.json({
        success: false,
        error: 'Appointment not found'
      }, { status: 404 });
    }

    mockAppointmentsList.splice(appointmentIndex, 1);
    
    return HttpResponse.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  }),

  // ===== DENTISTS ENDPOINTS =====

  // GET /api/dentists - List dentists
  http.get('/api/dentists', ({ request }) => {
    const url = new URL(request.url);
    const specialty = url.searchParams.get('specialty');
    const active = url.searchParams.get('active');
    const q = url.searchParams.get('q');

    let filteredDentists = [...mockDentistsList];

    if (specialty) {
      filteredDentists = filteredDentists.filter(d => 
        d.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
      );
    }

    if (active !== null) {
      filteredDentists = filteredDentists.filter(d => 
        d.active === (active === 'true')
      );
    }

    if (q) {
      const searchLower = q.toLowerCase();
      filteredDentists = filteredDentists.filter(d => 
        d.name.toLowerCase().includes(searchLower) ||
        d.email?.toLowerCase().includes(searchLower) ||
        d.specialties.some(s => s.toLowerCase().includes(searchLower))
      );
    }

    return HttpResponse.json({
      success: true,
      data: filteredDentists,
      total: filteredDentists.length
    });
  }),

  // GET /api/dentists/:id - Get single dentist
  http.get('/api/dentists/:id', ({ params }) => {
    const dentist = mockDentistsList.find(d => d.id === params.id);
    
    if (!dentist) {
      return HttpResponse.json({
        success: false,
        error: 'Dentist not found'
      }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      data: dentist
    });
  }),

  // POST /api/dentists - Create dentist
  http.post('/api/dentists', async ({ request }) => {
    try {
      const dentistData = await request.json() as any;
      
      const newDentist = {
        id: uuidv4(),
        ...dentistData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockDentistsList.push(newDentist);

      return HttpResponse.json({
        success: true,
        data: newDentist
      }, { status: 201 });
    } catch (error) {
      return HttpResponse.json({
        success: false,
        error: 'Invalid request data'
      }, { status: 400 });
    }
  }),

  // PATCH /api/dentists/:id - Update dentist
  http.patch('/api/dentists/:id', async ({ params, request }) => {
    try {
      const dentistIndex = mockDentistsList.findIndex(d => d.id === params.id);
      if (dentistIndex === -1) {
        return HttpResponse.json({
          success: false,
          error: 'Dentist not found'
        }, { status: 404 });
      }

      const updateData = await request.json() as any;
      const updatedDentist = {
        ...mockDentistsList[dentistIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      mockDentistsList[dentistIndex] = updatedDentist;

      return HttpResponse.json({
        success: true,
        data: updatedDentist
      });
    } catch (error) {
      return HttpResponse.json({
        success: false,
        error: 'Invalid request data'
      }, { status: 400 });
    }
  }),

  // GET /api/dentists/:id/availability - Get dentist availability
  http.get('/api/dentists/:id/availability', ({ params }) => {
    const dentist = mockDentistsList.find(d => d.id === params.id);
    
    if (!dentist) {
      return HttpResponse.json({
        success: false,
        error: 'Dentist not found'
      }, { status: 404 });
    }

    // Generate default availability
    const availability = {
      dentistId: params.id,
      rules: [
        { weekday: 1, start: "09:00", end: "17:00" },
        { weekday: 2, start: "09:00", end: "17:00" },
        { weekday: 3, start: "09:00", end: "17:00" },
        { weekday: 4, start: "09:00", end: "17:00" },
        { weekday: 5, start: "09:00", end: "16:00" }
      ],
      overrides: []
    };

    return HttpResponse.json({
      success: true,
      data: availability
    });
  }),

  // PUT /api/dentists/:id/availability - Update dentist availability
  http.put('/api/dentists/:id/availability', async ({ params, request }) => {
    try {
      const dentist = mockDentistsList.find(d => d.id === params.id);
      if (!dentist) {
        return HttpResponse.json({
          success: false,
          error: 'Dentist not found'
        }, { status: 404 });
      }

      const availabilityData = await request.json();
      
      // In a real app, this would be saved to availability store
      return HttpResponse.json({
        success: true,
        data: availabilityData
      });
    } catch (error) {
      return HttpResponse.json({
        success: false,
        error: 'Invalid availability data'
      }, { status: 400 });
    }
  }),

  // ===== PROCEDURES ENDPOINTS =====

  // GET /api/procedures - List procedures
  http.get('/api/procedures', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const active = url.searchParams.get('active');
    const q = url.searchParams.get('query');

    let filteredProcedures = [...mockProceduresList];

    if (category) {
      filteredProcedures = filteredProcedures.filter(p => 
        p.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (active !== null) {
      filteredProcedures = filteredProcedures.filter(p => 
        p.active === (active === 'true')
      );
    }

    if (q) {
      const searchLower = q.toLowerCase();
      filteredProcedures = filteredProcedures.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.code.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    return HttpResponse.json({
      success: true,
      data: filteredProcedures,
      total: filteredProcedures.length
    });
  }),

  // GET /api/procedures/:code - Get single procedure
  http.get('/api/procedures/:code', ({ params }) => {
    const procedure = mockProceduresList.find(p => p.code === params.code);
    
    if (!procedure) {
      return HttpResponse.json({
        success: false,
        error: 'Procedure not found'
      }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      data: procedure
    });
  }),

  // POST /api/procedures - Create procedure
  http.post('/api/procedures', async ({ request }) => {
    try {
      const procedureData = await request.json() as any;
      
      if (!procedureData || !procedureData.code) {
        return HttpResponse.json({
          success: false,
          error: 'Missing procedure data or code'
        }, { status: 400 });
      }
      
      // Check for duplicate code
      const existingProcedure = mockProceduresList.find(p => p.code === procedureData.code.toUpperCase());
      if (existingProcedure) {
        return HttpResponse.json({
          success: false,
          error: 'Procedure code already exists'
        }, { status: 409 });
      }
      
      const newProcedure = {
        ...procedureData,
        code: procedureData.code.toUpperCase(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockProceduresList.push(newProcedure);

      return HttpResponse.json({
        success: true,
        data: newProcedure
      }, { status: 201 });
    } catch (error) {
      return HttpResponse.json({
        success: false,
        error: 'Invalid request data'
      }, { status: 400 });
    }
  }),

  // PATCH /api/procedures/:code - Update procedure
  http.patch('/api/procedures/:code', async ({ params, request }) => {
    try {
      const procedureIndex = mockProceduresList.findIndex(p => p.code === params.code);
      if (procedureIndex === -1) {
        return HttpResponse.json({
          success: false,
          error: 'Procedure not found'
        }, { status: 404 });
      }

      const updateData = await request.json() as any;
      const updatedProcedure = {
        ...mockProceduresList[procedureIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      mockProceduresList[procedureIndex] = updatedProcedure;

      return HttpResponse.json({
        success: true,
        data: updatedProcedure
      });
    } catch (error) {
      return HttpResponse.json({
        success: false,
        error: 'Invalid request data'
      }, { status: 400 });
    }
  }),

  // DELETE /api/procedures/:code - Delete procedure
  http.delete('/api/procedures/:code', ({ params }) => {
    const procedureIndex = mockProceduresList.findIndex(p => p.code === params.code);
    if (procedureIndex === -1) {
      return HttpResponse.json({
        success: false,
        error: 'Procedure not found'
      }, { status: 404 });
    }

    mockProceduresList.splice(procedureIndex, 1);
    
    return HttpResponse.json({
      success: true,
      message: 'Procedure deleted successfully'
    });
  }),

  // GET /api/procedures/validate-code - Validate procedure code uniqueness
  http.get('/api/procedures/validate-code', ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      return HttpResponse.json({
        success: false,
        error: 'Code parameter is required'
      }, { status: 400 });
    }

    const exists = mockProceduresList.some(p => p.code === code.toUpperCase());
    
    return HttpResponse.json({
      success: true,
      unique: !exists
    });
  }),

  // Include telephony handlers
  ...telephonyHandlers
];

// Mock data stores for clinical modules  
let mockAppointmentsList = generateTodaysAppointments();
let mockPatients: PatientRef[] = []; // Will need to extract from existing functions