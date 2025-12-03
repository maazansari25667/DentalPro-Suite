// Domain Models for WavenetCare Dental Management System

export type UUID = string;

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

export enum VisitStatus {
  SCHEDULED = 'scheduled',
  CHECKED_IN = 'checked_in',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  EMERGENCY = 'emergency'
}

export enum QueueStatus {
  WAITING = 'waiting',
  CALLED = 'called',
  IN_TREATMENT = 'in_treatment',
  COMPLETED = 'completed'
}

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  CLEANING = 'cleaning',
  MAINTENANCE = 'maintenance'
}

export enum AppointmentType {
  CONSULTATION = 'consultation',
  CLEANING = 'cleaning',
  FILLING = 'filling',
  ROOT_CANAL = 'root_canal',
  EXTRACTION = 'extraction',
  CROWN = 'crown',
  BRIDGE = 'bridge',
  IMPLANT = 'implant',
  ORTHODONTICS = 'orthodontics',
  EMERGENCY = 'emergency'
}

// New Clinical Types
export type AppointmentStatus =
  | "scheduled" | "checked_in" | "in_progress"
  | "completed" | "cancelled" | "no_show";

export interface Dentist {
  id: UUID;
  name: string;
  email?: string;
  phone?: string;
  specialties: string[];   // ["general","endo","ortho"]
  color: string;
  active: boolean;
  bio?: string;
  licenseNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DentistAvailability {
  dentistId: UUID;
  rules: Array<{
    weekday: 0|1|2|3|4|5|6;  // 0=Sun
    start: string;           // "09:00"
    end: string;             // "17:00"
  }>;
  overrides?: Array<{
    date: string;            // ISO yyyy-mm-dd
    start?: string;
    end?: string;
    closed?: boolean;
  }>;
}

export interface Procedure {
  code: string;              // unique, uppercase
  name: string;
  defaultMinutes: number;    // 5–240
  price: number;             // >= 0
  category?: string;         // e.g., "Endodontics"
  active: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentDetail extends Appointment {
  status: AppointmentStatus;
}

export interface AppointmentFormInput {
  patientId: UUID;
  dentistId: UUID;
  procedureCode: string;
  roomId?: UUID;
  scheduledStart: string;    // ISO
  scheduledMinutes: number;
  notes?: string;
}

// Reference Types
export interface PatientRef {
  id: UUID;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  dateOfBirth: string;
  gender: Gender;
}

export interface DentistRef {
  id: UUID;
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
}

export interface Room {
  id: UUID;
  name: string;
  floor: number;
  capacity: number;
  equipment: string[];
  status: RoomStatus;
  lastCleaned?: string;
  currentPatientId?: UUID;
  currentDentistId?: UUID;
}

export interface ProcedureRef {
  id: UUID;
  name: string;
  code: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: string;
  requiresAnesthesia: boolean;
  followUpRequired: boolean;
}

// Core Entities
export interface Appointment {
  id: UUID;
  patient: PatientRef;
  dentist: Dentist;  // Use new Dentist type
  room?: Room;
  procedure: Procedure;  // Use new Procedure type
  scheduledStart: string; // ISO datetime string
  scheduledMinutes: number; // in minutes
  status: AppointmentStatus;  // Use new AppointmentStatus
  priority: Priority;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentDetail extends Appointment {
  // Additional fields for detail view
  actualStart?: string;
  actualEnd?: string;
  statusHistory?: Array<{
    status: AppointmentStatus;
    timestamp: string;
    userId?: string;
    notes?: string;
  }>;
}

export interface CheckIn {
  id: UUID;
  appointmentId?: UUID;
  linkedAppointmentId?: UUID; // For form compatibility  
  patient?: PatientRef; // For existing patients
  walkInPatient?: PatientRef; // For walk-in patients  
  checkInTime: string; // ISO datetime string
  priority: Priority;
  reasonForVisit: string;
  isWalkIn: boolean;
  symptoms?: string;
  vitalSigns?: {
    bloodPressure?: string;
    temperature?: number;
    heartRate?: number;
    notes?: string;
  };
  insuranceVerified: boolean;
  consentSigned: boolean;
  status: VisitStatus;
  estimatedWaitTime?: number; // in minutes
  createdAt: string;
  updatedAt: string;
}

export interface QueueTicket {
  id: UUID;
  checkInId: UUID;
  patient: PatientRef;
  dentist?: DentistRef;
  room?: Room;
  procedure?: ProcedureRef;
  priority: Priority;
  status: QueueStatus;
  ticketNumber: string;
  estimatedDuration?: number; // in minutes
  actualStartTime?: string;
  actualEndTime?: string;
  queuePosition: number;
  createdAt: string;
  updatedAt: string;
}

export interface TurnoverTimer {
  id: UUID;
  roomId: UUID;
  previousPatientId: UUID;
  nextPatientId?: UUID;
  startTime: string;
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  tasks: {
    id: string;
    description: string;
    completed: boolean;
    completedAt?: string;
    assignedTo?: string;
  }[];
  status: 'in_progress' | 'completed' | 'overdue';
}

export interface NowServing {
  id: UUID;
  ticketNumber: string;
  patient: PatientRef;
  dentist: DentistRef;
  room: Room;
  calledAt: string;
  displayDuration: number; // seconds to display
  soundAlert: boolean;
  displayMessage?: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form Types
export interface CreateCheckInRequest {
  patientId?: UUID;
  walkInPatient?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
    dateOfBirth: string;
    gender: Gender;
  };
  priority: Priority;
  reasonForVisit: string;
  symptoms?: string;
  isWalkIn: boolean;
}

export interface CreateQueueTicketRequest {
  checkInId: UUID;
  dentistId?: UUID;
  roomId?: UUID;
  procedureId?: UUID;
  priority: Priority;
  estimatedDuration?: number;
}

export interface UpdateQueueTicketRequest {
  dentistId?: UUID;
  roomId?: UUID;
  procedureId?: UUID;
  priority?: Priority;
  status?: QueueStatus;
  queuePosition?: number;
}

export interface NowServingRequest {
  ticketId: UUID;
  displayDuration?: number;
  soundAlert?: boolean;
  displayMessage?: string;
}

// Filter Types
export interface AppointmentFilters {
  date?: string;
  dentistIds?: UUID[];
  roomIds?: UUID[];
  status?: AppointmentStatus[];
  priority?: Priority[];
  search?: string;
}

export interface QueueFilters {
  dentistIds?: UUID[];
  roomIds?: UUID[];
  status?: QueueStatus[];
  priority?: Priority[];
  showUrgentOnly?: boolean;
}

export interface CheckInFilters {
  date?: string;
  status?: VisitStatus[];
  isWalkIn?: boolean;
  priority?: Priority[];
  search?: string;
}

// Stats Types
export interface QueueStats {
  totalWaiting: number;
  averageWaitTime: number;
  longestWaitTime: number;
  totalServedToday: number;
  urgentCases: number;
  roomUtilization: Record<UUID, number>;
  dentistWorkload: Record<UUID, number>;
}

export interface DashboardStats {
  todayAppointments: number;
  checkedInPatients: number;
  waitingPatients: number;
  inTreatment: number;
  completedToday: number;
  urgentCases: number;
  availableRooms: number;
  activeDentists: number;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Socket Events
export interface SocketEvent {
  type: 'queue_updated' | 'check_in_created' | 'appointment_updated' | 'now_serving' | 'room_status_changed';
  data: unknown;
  timestamp: string;
}