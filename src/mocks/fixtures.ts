import { 
  DentistRef, PatientRef, Room, ProcedureRef, Appointment, CheckIn, QueueTicket, 
  Gender, VisitStatus, Priority, QueueStatus, RoomStatus, AppointmentType,
  Dentist, Procedure, AppointmentStatus, DentistAvailability
} from '@/lib/domain';
import { v4 as uuidv4 } from 'uuid';

// Generate realistic fixtures
export const mockDentists: DentistRef[] = [
  {
    id: 'dentist-001',
    firstName: 'Sarah',
    lastName: 'Williams',
    specialization: 'General Dentistry',
    licenseNumber: 'DDS-2019-001',
    phoneNumber: '(555) 123-4567',
    email: 'sarah.williams@wavenetcare.com',
    isActive: true
  },
  {
    id: 'dentist-002',
    firstName: 'Michael',
    lastName: 'Chen',
    specialization: 'Orthodontics',
    licenseNumber: 'DDS-2020-002',
    phoneNumber: '(555) 234-5678',
    email: 'michael.chen@wavenetcare.com',
    isActive: true
  },
  {
    id: 'dentist-003',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    specialization: 'Oral Surgery',
    licenseNumber: 'DDS-2018-003',
    phoneNumber: '(555) 345-6789',
    email: 'emily.rodriguez@wavenetcare.com',
    isActive: true
  },
  {
    id: 'dentist-004',
    firstName: 'David',
    lastName: 'Thompson',
    specialization: 'Pediatric Dentistry',
    licenseNumber: 'DDS-2021-004',
    phoneNumber: '(555) 456-7890',
    email: 'david.thompson@wavenetcare.com',
    isActive: true
  },
  {
    id: 'dentist-005',
    firstName: 'Lisa',
    lastName: 'Anderson',
    specialization: 'Endodontics',
    licenseNumber: 'DDS-2017-005',
    phoneNumber: '(555) 567-8901',
    email: 'lisa.anderson@wavenetcare.com',
    isActive: false
  }
];

export const mockRooms: Room[] = [
  {
    id: 'room-001',
    name: 'Room 101',
    floor: 1,
    capacity: 1,
    equipment: ['Digital X-Ray', 'LED Surgical Light', 'Ultrasonic Scaler'],
    status: RoomStatus.AVAILABLE,
    lastCleaned: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'room-002',
    name: 'Room 102',
    floor: 1,
    capacity: 1,
    equipment: ['Digital X-Ray', 'LED Surgical Light', 'Laser Therapy Unit'],
    status: RoomStatus.OCCUPIED,
    lastCleaned: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    currentPatientId: 'patient-003',
    currentDentistId: 'dentist-001'
  },
  {
    id: 'room-003',
    name: 'Room 201',
    floor: 2,
    capacity: 2,
    equipment: ['Panoramic X-Ray', 'LED Surgical Light', 'Nitrous Oxide'],
    status: RoomStatus.CLEANING,
    lastCleaned: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'room-004',
    name: 'Room 202',
    floor: 2,
    capacity: 1,
    equipment: ['Digital X-Ray', 'LED Surgical Light', 'CAD/CAM System'],
    status: RoomStatus.AVAILABLE,
    lastCleaned: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'room-005',
    name: 'Surgery Room 1',
    floor: 2,
    capacity: 1,
    equipment: ['Surgical Microscope', 'Anesthesia Machine', 'Monitor'],
    status: RoomStatus.OCCUPIED,
    lastCleaned: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    currentPatientId: 'patient-007',
    currentDentistId: 'dentist-003'
  },
  {
    id: 'room-006',
    name: 'Emergency Room',
    floor: 1,
    capacity: 1,
    equipment: ['Portable X-Ray', 'Emergency Kit', 'Oxygen Tank'],
    status: RoomStatus.MAINTENANCE,
    lastCleaned: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  }
];

export const mockProcedures: ProcedureRef[] = [
  {
    id: 'proc-001',
    name: 'Routine Cleaning',
    code: 'D1110',
    description: 'Prophylaxis - adult',
    duration: 60,
    price: 120,
    category: 'Preventive',
    requiresAnesthesia: false,
    followUpRequired: false
  },
  {
    id: 'proc-002',
    name: 'Tooth Filling',
    code: 'D2391',
    description: 'One surface posterior resin-based composite',
    duration: 45,
    price: 185,
    category: 'Restorative',
    requiresAnesthesia: true,
    followUpRequired: false
  },
  {
    id: 'proc-003',
    name: 'Root Canal',
    code: 'D3310',
    description: 'Endodontic therapy, anterior tooth',
    duration: 90,
    price: 850,
    category: 'Endodontics',
    requiresAnesthesia: true,
    followUpRequired: true
  },
  {
    id: 'proc-004',
    name: 'Tooth Extraction',
    code: 'D7140',
    description: 'Extraction, erupted tooth or exposed root',
    duration: 30,
    price: 225,
    category: 'Oral Surgery',
    requiresAnesthesia: true,
    followUpRequired: true
  },
  {
    id: 'proc-005',
    name: 'Crown Preparation',
    code: 'D2740',
    description: 'Crown - porcelain/ceramic substrate',
    duration: 120,
    price: 1200,
    category: 'Restorative',
    requiresAnesthesia: true,
    followUpRequired: true
  }
];

// Helper function to generate today's date
const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

// Generate appointments for today
export const generateTodayAppointments = (): Appointment[] => {
  const today = getTodayString();
  const appointments: Appointment[] = [];
  
  const times = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const patients = [
    { id: 'patient-001', firstName: 'John', lastName: 'Smith', phoneNumber: '(555) 111-2222', dateOfBirth: '1985-03-15', gender: Gender.MALE },
    { id: 'patient-002', firstName: 'Emma', lastName: 'Johnson', phoneNumber: '(555) 222-3333', dateOfBirth: '1990-07-22', gender: Gender.FEMALE },
    { id: 'patient-003', firstName: 'Michael', lastName: 'Brown', phoneNumber: '(555) 333-4444', dateOfBirth: '1978-11-08', gender: Gender.MALE },
    { id: 'patient-004', firstName: 'Sarah', lastName: 'Davis', phoneNumber: '(555) 444-5555', dateOfBirth: '1995-02-14', gender: Gender.FEMALE },
    { id: 'patient-005', firstName: 'Robert', lastName: 'Wilson', phoneNumber: '(555) 555-6666', dateOfBirth: '1982-09-30', gender: Gender.MALE },
    { id: 'patient-006', firstName: 'Jessica', lastName: 'Martinez', phoneNumber: '(555) 666-7777', dateOfBirth: '1988-12-03', gender: Gender.FEMALE },
    { id: 'patient-007', firstName: 'David', lastName: 'Taylor', phoneNumber: '(555) 777-8888', dateOfBirth: '1975-06-18', gender: Gender.MALE },
    { id: 'patient-008', firstName: 'Ashley', lastName: 'Anderson', phoneNumber: '(555) 888-9999', dateOfBirth: '1992-04-25', gender: Gender.FEMALE }
  ];

  for (let i = 0; i < 25; i++) {
    const patient = patients[i % patients.length];
    const dentist = mockDentistsList[i % mockDentistsList.length];
    const procedure = mockProceduresList[i % mockProceduresList.length];
    const room = mockRooms[i % (mockRooms.length - 1)]; // Exclude emergency room
    const time = times[i % times.length];
    
    const statuses = [VisitStatus.SCHEDULED, VisitStatus.CHECKED_IN, VisitStatus.IN_PROGRESS, VisitStatus.COMPLETED];
    const priorities = [Priority.NORMAL, Priority.NORMAL, Priority.HIGH, Priority.LOW, Priority.URGENT];
    
    appointments.push({
      id: `appointment-${String(i + 1).padStart(3, '0')}`,
      patient: { 
        ...patient, 
        id: `${patient.id}-${i}`,
        email: `${patient.firstName.toLowerCase()}.${patient.lastName.toLowerCase()}@email.com`
      },
      dentist,
      room,
      procedure,
      scheduledStart: `${today}T${time}:00.000Z`,
      scheduledMinutes: procedure.defaultMinutes,
      status: statuses[i % statuses.length],
      priority: priorities[i % priorities.length],
      notes: i % 5 === 0 ? 'Patient has dental anxiety' : undefined,
      createdAt: new Date(Date.now() - (25 - i) * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString()
    });
  }

  return appointments;
};

// Generate current check-ins
export const generateCurrentCheckIns = (): CheckIn[] => {
  const checkIns: CheckIn[] = [];
  const now = new Date();
  
  const walkInPatients = [
    { firstName: 'Mark', lastName: 'Johnson', phoneNumber: '(555) 900-1111', dateOfBirth: '1987-08-12', gender: Gender.MALE },
    { firstName: 'Linda', lastName: 'White', phoneNumber: '(555) 900-2222', dateOfBirth: '1993-05-07', gender: Gender.FEMALE },
    { firstName: 'James', lastName: 'Garcia', phoneNumber: '(555) 900-3333', dateOfBirth: '1980-12-20', gender: Gender.MALE },
    { firstName: 'Maria', lastName: 'Lopez', phoneNumber: '(555) 900-4444', dateOfBirth: '1985-09-15', gender: Gender.FEMALE }
  ];

  const reasons = [
    'Tooth pain',
    'Routine cleaning',
    'Emergency - broken tooth',
    'Follow-up appointment'
  ];

  const priorities = [Priority.URGENT, Priority.NORMAL, Priority.EMERGENCY, Priority.HIGH];

  for (let i = 0; i < 4; i++) {
    const patient = walkInPatients[i];
    const checkInTime = new Date(now.getTime() - (4 - i) * 30 * 60 * 1000); // Staggered check-ins
    
    checkIns.push({
      id: `checkin-${String(i + 1).padStart(3, '0')}`,
      appointmentId: i === 1 ? 'appointment-005' : undefined, // One scheduled appointment
      patient: {
        ...patient,
        id: `walkin-patient-${i + 1}`,
        email: `${patient.firstName.toLowerCase()}.${patient.lastName.toLowerCase()}@email.com`
      },
      checkInTime: checkInTime.toISOString(),
      priority: priorities[i],
      reasonForVisit: reasons[i],
      isWalkIn: i !== 1, // One is not a walk-in
      symptoms: i === 0 ? 'Severe throbbing pain in lower right molar' : i === 2 ? 'Chipped front tooth from fall' : undefined,
      vitalSigns: {
        bloodPressure: '120/80',
        temperature: 98.6,
        heartRate: 72,
        notes: i === 0 ? 'Patient appears to be in significant discomfort' : undefined
      },
      insuranceVerified: i !== 3, // One still pending
      consentSigned: i !== 3,
      status: i < 2 ? VisitStatus.CHECKED_IN : VisitStatus.IN_PROGRESS,
      estimatedWaitTime: i === 0 ? 15 : i === 1 ? 30 : i === 2 ? 5 : 45,
      createdAt: checkInTime.toISOString(),
      updatedAt: new Date(checkInTime.getTime() + 5 * 60 * 1000).toISOString()
    });
  }

  return checkIns;
};

// Generate current queue tickets
export const generateQueueTickets = (): QueueTicket[] => {
  const checkIns = generateCurrentCheckIns();
  const tickets: QueueTicket[] = [];

  checkIns.forEach((checkIn, index) => {
    if (checkIn.status === VisitStatus.CHECKED_IN || checkIn.status === VisitStatus.IN_PROGRESS) {
      const dentist = mockDentists[index % mockDentists.length];
      const room = mockRooms.filter(r => r.status === RoomStatus.AVAILABLE || r.status === RoomStatus.OCCUPIED)[index % 3];
      const procedure = mockProcedures[index % mockProcedures.length];

      tickets.push({
        id: `ticket-${String(index + 1).padStart(3, '0')}`,
        checkInId: checkIn.id,
        patient: checkIn.patient as PatientRef,
        dentist: index < 2 ? dentist : undefined, // First two have assigned dentists
        room: index === 1 ? room : undefined, // One is in treatment
        procedure: index < 3 ? procedure : undefined,
        priority: checkIn.priority,
        status: index === 1 ? QueueStatus.IN_TREATMENT : QueueStatus.WAITING,
        ticketNumber: `T${String(index + 1).padStart(3, '0')}`,
        estimatedDuration: procedure?.duration,
        actualStartTime: index === 1 ? new Date(Date.now() - 20 * 60 * 1000).toISOString() : undefined,
        queuePosition: index === 1 ? 0 : index + 1,
        createdAt: checkIn.createdAt,
        updatedAt: checkIn.updatedAt
      });
    }
  });

  return tickets;
};

// Clinical Data: Dentists
export const mockDentistsList: Dentist[] = [
  {
    id: 'dentist-001',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@wavenetcare.com',
    phone: '+1 (555) 123-4567',
    specialties: ['General Dentistry', 'Cosmetic Dentistry'],
    color: '#3B82F6',
    active: true,
    bio: 'Dr. Johnson has over 15 years of experience in general and cosmetic dentistry.',
    licenseNumber: 'DDS12345',
    createdAt: '2023-01-15T08:00:00Z',
    updatedAt: '2024-11-01T10:30:00Z'
  },
  {
    id: 'dentist-002',
    name: 'Dr. Michael Chen',
    email: 'michael.chen@wavenetcare.com',
    phone: '+1 (555) 234-5678',
    specialties: ['Endodontics', 'Oral Surgery'],
    color: '#10B981',
    active: true,
    bio: 'Specialized in root canal therapy and complex oral surgical procedures.',
    licenseNumber: 'DDS23456',
    createdAt: '2023-02-20T09:00:00Z',
    updatedAt: '2024-10-15T14:20:00Z'
  },
  {
    id: 'dentist-003',
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@wavenetcare.com',
    phone: '+1 (555) 345-6789',
    specialties: ['Orthodontics', 'Pediatric Dentistry'],
    color: '#F59E0B',
    active: true,
    bio: 'Expert in braces, aligners, and pediatric dental care.',
    licenseNumber: 'DDS34567',
    createdAt: '2023-03-10T07:30:00Z',
    updatedAt: '2024-11-05T16:45:00Z'
  },
  {
    id: 'dentist-004',
    name: 'Dr. James Wilson',
    email: 'james.wilson@wavenetcare.com',
    phone: '+1 (555) 456-7890',
    specialties: ['Periodontics', 'Implantology'],
    color: '#EF4444',
    active: true,
    bio: 'Specializes in gum disease treatment and dental implants.',
    licenseNumber: 'DDS45678',
    createdAt: '2023-04-05T08:15:00Z',
    updatedAt: '2024-10-28T11:10:00Z'
  },
  {
    id: 'dentist-005',
    name: 'Dr. Lisa Park',
    email: 'lisa.park@wavenetcare.com',
    phone: '+1 (555) 567-8901',
    specialties: ['Prosthodontics', 'Cosmetic Dentistry'],
    color: '#8B5CF6',
    active: true,
    bio: 'Expert in crowns, bridges, and complete smile makeovers.',
    licenseNumber: 'DDS56789',
    createdAt: '2023-05-12T09:45:00Z',
    updatedAt: '2024-11-08T13:25:00Z'
  },
  {
    id: 'dentist-006',
    name: 'Dr. David Kim',
    email: 'david.kim@wavenetcare.com',
    phone: '+1 (555) 678-9012',
    specialties: ['General Dentistry', 'Emergency Care'],
    color: '#06B6D4',
    active: true,
    bio: 'General dentist with expertise in emergency dental care.',
    licenseNumber: 'DDS67890',
    createdAt: '2023-06-18T10:00:00Z',
    updatedAt: '2024-10-20T15:30:00Z'
  },
  {
    id: 'dentist-007',
    name: 'Dr. Maria Garcia',
    email: 'maria.garcia@wavenetcare.com',
    phone: '+1 (555) 789-0123',
    specialties: ['Oral Surgery', 'Maxillofacial Surgery'],
    color: '#F97316',
    active: true,
    bio: 'Oral and maxillofacial surgeon with 12 years of experience.',
    licenseNumber: 'DDS78901',
    createdAt: '2023-07-22T08:30:00Z',
    updatedAt: '2024-11-02T12:15:00Z'
  },
  {
    id: 'dentist-008',
    name: 'Dr. Robert Taylor',
    email: 'robert.taylor@wavenetcare.com',
    phone: '+1 (555) 890-1234',
    specialties: ['General Dentistry', 'Preventive Care'],
    color: '#84CC16',
    active: true,
    bio: 'Focused on preventive dentistry and patient education.',
    licenseNumber: 'DDS89012',
    createdAt: '2023-08-14T07:45:00Z',
    updatedAt: '2024-10-25T09:50:00Z'
  },
  {
    id: 'dentist-009',
    name: 'Dr. Jennifer Brown',
    email: 'jennifer.brown@wavenetcare.com',
    phone: '+1 (555) 901-2345',
    specialties: ['Endodontics', 'Pain Management'],
    color: '#EC4899',
    active: true,
    bio: 'Endodontist specializing in complex root canal procedures.',
    licenseNumber: 'DDS90123',
    createdAt: '2023-09-05T09:20:00Z',
    updatedAt: '2024-11-06T14:40:00Z'
  },
  {
    id: 'dentist-010',
    name: 'Dr. Christopher Lee',
    email: 'christopher.lee@wavenetcare.com',
    phone: '+1 (555) 012-3456',
    specialties: ['Orthodontics', 'TMJ Treatment'],
    color: '#6366F1',
    active: true,
    bio: 'Orthodontist with expertise in TMJ disorders.',
    licenseNumber: 'DDS01234',
    createdAt: '2023-10-10T08:10:00Z',
    updatedAt: '2024-10-30T16:20:00Z'
  },
  {
    id: 'dentist-011',
    name: 'Dr. Amanda White',
    email: 'amanda.white@wavenetcare.com',
    phone: '+1 (555) 123-0456',
    specialties: ['Pediatric Dentistry', 'Special Needs Dentistry'],
    color: '#F472B6',
    active: true,
    bio: 'Pediatric dentist specializing in special needs patients.',
    licenseNumber: 'DDS12340',
    createdAt: '2023-11-15T10:30:00Z',
    updatedAt: '2024-11-07T11:45:00Z'
  },
  {
    id: 'dentist-012',
    name: 'Dr. Thomas Anderson',
    email: 'thomas.anderson@wavenetcare.com',
    phone: '+1 (555) 234-0567',
    specialties: ['Prosthodontics', 'Implantology'],
    color: '#22D3EE',
    active: true,
    bio: 'Prosthodontist with advanced implant training.',
    licenseNumber: 'DDS23401',
    createdAt: '2024-01-08T09:15:00Z',
    updatedAt: '2024-11-04T13:55:00Z'
  },
  {
    id: 'dentist-013',
    name: 'Dr. Rachel Davis',
    email: 'rachel.davis@wavenetcare.com',
    phone: '+1 (555) 345-0678',
    specialties: ['General Dentistry', 'Geriatric Dentistry'],
    color: '#A855F7',
    active: true,
    bio: 'General dentist with focus on elderly patient care.',
    licenseNumber: 'DDS34012',
    createdAt: '2024-02-12T08:45:00Z',
    updatedAt: '2024-10-18T15:10:00Z'
  },
  {
    id: 'dentist-014',
    name: 'Dr. Kevin Martinez',
    email: 'kevin.martinez@wavenetcare.com',
    phone: '+1 (555) 456-0789',
    specialties: ['Oral Surgery', 'Trauma Surgery'],
    color: '#FB7185',
    active: true,
    bio: 'Oral surgeon specializing in facial trauma reconstruction.',
    licenseNumber: 'DDS45012',
    createdAt: '2024-03-20T07:20:00Z',
    updatedAt: '2024-11-01T12:30:00Z'
  },
  {
    id: 'dentist-015',
    name: 'Dr. Nicole Thompson',
    email: 'nicole.thompson@wavenetcare.com',
    phone: '+1 (555) 567-0890',
    specialties: ['Cosmetic Dentistry', 'Restorative Dentistry'],
    color: '#34D399',
    active: true,
    bio: 'Cosmetic dentist specializing in aesthetic restorations.',
    licenseNumber: 'DDS56012',
    createdAt: '2024-04-25T10:05:00Z',
    updatedAt: '2024-11-09T14:15:00Z'
  }
];

// Clinical Data: Procedures  
export const mockProceduresList: Procedure[] = [
  {
    code: 'CLEAN01',
    name: 'Routine Cleaning',
    defaultMinutes: 60,
    price: 120.00,
    category: 'Preventive',
    active: true,
    description: 'Standard dental cleaning with plaque and tartar removal',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'EXAM01',
    name: 'Comprehensive Oral Examination',
    defaultMinutes: 45,
    price: 85.00,
    category: 'Diagnostic',
    active: true,
    description: 'Complete oral health assessment including X-rays',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'FILL01',
    name: 'Composite Filling - Single Surface',
    defaultMinutes: 45,
    price: 150.00,
    category: 'Restorative',
    active: true,
    description: 'Tooth-colored composite filling for single surface',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'FILL02',
    name: 'Composite Filling - Multi Surface',
    defaultMinutes: 60,
    price: 220.00,
    category: 'Restorative',
    active: true,
    description: 'Tooth-colored composite filling for multiple surfaces',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'ROOT01',
    name: 'Root Canal Therapy - Anterior',
    defaultMinutes: 90,
    price: 850.00,
    category: 'Endodontics',
    active: true,
    description: 'Root canal treatment for front teeth',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'ROOT02',
    name: 'Root Canal Therapy - Posterior',
    defaultMinutes: 120,
    price: 1200.00,
    category: 'Endodontics',
    active: true,
    description: 'Root canal treatment for back teeth',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'CROWN01',
    name: 'Porcelain Crown',
    defaultMinutes: 90,
    price: 1100.00,
    category: 'Prosthodontics',
    active: true,
    description: 'Full porcelain crown restoration',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'BRIDGE01',
    name: '3-Unit Bridge',
    defaultMinutes: 120,
    price: 3200.00,
    category: 'Prosthodontics',
    active: true,
    description: 'Three-unit fixed bridge restoration',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'EXTRACT01',
    name: 'Simple Extraction',
    defaultMinutes: 30,
    price: 180.00,
    category: 'Oral Surgery',
    active: true,
    description: 'Simple tooth extraction with local anesthesia',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'EXTRACT02',
    name: 'Surgical Extraction',
    defaultMinutes: 60,
    price: 350.00,
    category: 'Oral Surgery',
    active: true,
    description: 'Surgical tooth extraction with tissue reflection',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'IMPLANT01',
    name: 'Single Dental Implant',
    defaultMinutes: 90,
    price: 2500.00,
    category: 'Implantology',
    active: true,
    description: 'Single tooth implant placement',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'WHITENING01',
    name: 'Professional Teeth Whitening',
    defaultMinutes: 60,
    price: 450.00,
    category: 'Cosmetic',
    active: true,
    description: 'In-office professional teeth whitening treatment',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'VENEER01',
    name: 'Porcelain Veneer',
    defaultMinutes: 75,
    price: 1200.00,
    category: 'Cosmetic',
    active: true,
    description: 'Custom porcelain veneer placement',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'ORTHO01',
    name: 'Orthodontic Consultation',
    defaultMinutes: 60,
    price: 150.00,
    category: 'Orthodontics',
    active: true,
    description: 'Initial orthodontic evaluation and treatment planning',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'ORTHO02',
    name: 'Braces Installation',
    defaultMinutes: 120,
    price: 5500.00,
    category: 'Orthodontics',
    active: true,
    description: 'Traditional metal braces installation',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'ORTHO03',
    name: 'Invisalign Treatment',
    defaultMinutes: 45,
    price: 6500.00,
    category: 'Orthodontics',
    active: true,
    description: 'Clear aligner orthodontic treatment',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'PERIO01',
    name: 'Deep Cleaning - Per Quadrant',
    defaultMinutes: 60,
    price: 200.00,
    category: 'Periodontics',
    active: true,
    description: 'Scaling and root planing for gum disease',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'PERIO02',
    name: 'Gum Graft Surgery',
    defaultMinutes: 90,
    price: 1200.00,
    category: 'Periodontics',
    active: true,
    description: 'Soft tissue graft for gum recession',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'PEDO01',
    name: 'Pediatric Cleaning',
    defaultMinutes: 45,
    price: 90.00,
    category: 'Pediatric',
    active: true,
    description: 'Dental cleaning for children',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'PEDO02',
    name: 'Pediatric Sealants',
    defaultMinutes: 30,
    price: 60.00,
    category: 'Pediatric',
    active: true,
    description: 'Protective sealants for children\'s teeth',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'EMERG01',
    name: 'Emergency Consultation',
    defaultMinutes: 30,
    price: 150.00,
    category: 'Emergency',
    active: true,
    description: 'Urgent dental problem evaluation',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'EMERG02',
    name: 'Emergency Pain Relief',
    defaultMinutes: 45,
    price: 200.00,
    category: 'Emergency',
    active: true,
    description: 'Immediate treatment for dental pain',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'XRAY01',
    name: 'Bitewing X-rays',
    defaultMinutes: 15,
    price: 50.00,
    category: 'Diagnostic',
    active: true,
    description: 'Set of 4 bitewing radiographs',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'XRAY02',
    name: 'Panoramic X-ray',
    defaultMinutes: 10,
    price: 75.00,
    category: 'Diagnostic',
    active: true,
    description: 'Full mouth panoramic radiograph',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'CONSULT01',
    name: 'Specialist Consultation',
    defaultMinutes: 45,
    price: 200.00,
    category: 'Consultation',
    active: true,
    description: 'Consultation with dental specialist',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    code: 'SEDATION01',
    name: 'Nitrous Oxide Sedation',
    defaultMinutes: 5,
    price: 75.00,
    category: 'Sedation',
    active: true,
    description: 'Nitrous oxide administration for anxiety relief',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  }
];

// Generate today's appointments (23 total)
export const generateTodaysAppointments = (): Appointment[] => {
  const appointments: Appointment[] = [];
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const statuses: AppointmentStatus[] = ["scheduled", "checked_in", "in_progress", "completed", "cancelled", "no_show"];
  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"
  ];
  
  const patients = [
    { firstName: "John", lastName: "Smith", phoneNumber: "+1-555-0101", email: "john.smith@email.com" },
    { firstName: "Mary", lastName: "Johnson", phoneNumber: "+1-555-0102", email: "mary.johnson@email.com" },
    { firstName: "Robert", lastName: "Williams", phoneNumber: "+1-555-0103", email: "robert.williams@email.com" },
    { firstName: "Patricia", lastName: "Brown", phoneNumber: "+1-555-0104", email: "patricia.brown@email.com" },
    { firstName: "Michael", lastName: "Davis", phoneNumber: "+1-555-0105", email: "michael.davis@email.com" },
    { firstName: "Jennifer", lastName: "Miller", phoneNumber: "+1-555-0106", email: "jennifer.miller@email.com" },
    { firstName: "William", lastName: "Wilson", phoneNumber: "+1-555-0107", email: "william.wilson@email.com" },
    { firstName: "Elizabeth", lastName: "Moore", phoneNumber: "+1-555-0108", email: "elizabeth.moore@email.com" },
    { firstName: "David", lastName: "Taylor", phoneNumber: "+1-555-0109", email: "david.taylor@email.com" },
    { firstName: "Barbara", lastName: "Anderson", phoneNumber: "+1-555-0110", email: "barbara.anderson@email.com" },
    { firstName: "Richard", lastName: "Thomas", phoneNumber: "+1-555-0111", email: "richard.thomas@email.com" },
    { firstName: "Susan", lastName: "Jackson", phoneNumber: "+1-555-0112", email: "susan.jackson@email.com" },
    { firstName: "Joseph", lastName: "White", phoneNumber: "+1-555-0113", email: "joseph.white@email.com" },
    { firstName: "Jessica", lastName: "Harris", phoneNumber: "+1-555-0114", email: "jessica.harris@email.com" },
    { firstName: "Thomas", lastName: "Martin", phoneNumber: "+1-555-0115", email: "thomas.martin@email.com" },
    { firstName: "Sarah", lastName: "Garcia", phoneNumber: "+1-555-0116", email: "sarah.garcia@email.com" },
    { firstName: "Charles", lastName: "Martinez", phoneNumber: "+1-555-0117", email: "charles.martinez@email.com" },
    { firstName: "Karen", lastName: "Robinson", phoneNumber: "+1-555-0118", email: "karen.robinson@email.com" },
    { firstName: "Christopher", lastName: "Clark", phoneNumber: "+1-555-0119", email: "christopher.clark@email.com" },
    { firstName: "Nancy", lastName: "Rodriguez", phoneNumber: "+1-555-0120", email: "nancy.rodriguez@email.com" },
    { firstName: "Daniel", lastName: "Lewis", phoneNumber: "+1-555-0121", email: "daniel.lewis@email.com" },
    { firstName: "Lisa", lastName: "Lee", phoneNumber: "+1-555-0122", email: "lisa.lee@email.com" },
    { firstName: "Matthew", lastName: "Walker", phoneNumber: "+1-555-0123", email: "matthew.walker@email.com" }
  ];
  
  for (let i = 0; i < 23; i++) {
    const patient = patients[i];
    const dentist = mockDentistsList[i % mockDentistsList.length];
    const procedure = mockProceduresList[i % mockProceduresList.length];
    const room = mockRooms[i % mockRooms.length];
    const timeSlot = timeSlots[i];
    const status = statuses[i % statuses.length];
    
    appointments.push({
      id: `appointment-${String(i + 1).padStart(3, '0')}`,
      patient: {
        id: `patient-${String(i + 1).padStart(3, '0')}`,
        firstName: patient.firstName,
        lastName: patient.lastName,
        phoneNumber: patient.phoneNumber,
        email: patient.email,
        dateOfBirth: `19${80 + (i % 30)}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE
      },
      dentist,
      room,
      procedure,
      scheduledStart: `${todayStr}T${timeSlot}:00Z`,
      scheduledMinutes: procedure.defaultMinutes,
      status,
      priority: i < 3 ? Priority.URGENT : i < 8 ? Priority.HIGH : Priority.NORMAL,
      notes: i % 4 === 0 ? `Follow-up for ${procedure.name.toLowerCase()}` : undefined,
      createdAt: new Date(today.getTime() - (23 - i) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(today.getTime() - (i % 5) * 60 * 60 * 1000).toISOString()
    });
  }
  
  return appointments;
};

// Generate dentist availability data
export const generateDentistAvailability = (dentistId: string): DentistAvailability => {
  return {
    dentistId,
    rules: [
      { weekday: 1, start: "08:00", end: "17:00" }, // Monday
      { weekday: 2, start: "08:00", end: "17:00" }, // Tuesday  
      { weekday: 3, start: "08:00", end: "17:00" }, // Wednesday
      { weekday: 4, start: "08:00", end: "17:00" }, // Thursday
      { weekday: 5, start: "08:00", end: "16:00" }, // Friday (shorter)
    ],
    overrides: [
      {
        date: "2024-12-25", // Christmas
        closed: true
      },
      {
        date: "2024-12-24", // Christmas Eve
        start: "08:00",
        end: "12:00"
      }
    ]
  };
};