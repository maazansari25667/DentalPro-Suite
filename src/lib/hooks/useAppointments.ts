import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Appointment, AppointmentFilters } from '@/lib/domain';

// API functions
async function fetchAppointments(date?: string): Promise<Appointment[]> {
  const url = new URL('/api/appointments', window.location.origin);
  if (date) {
    url.searchParams.set('date', date);
  }
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch appointments');
  }
  const data = await response.json();
  return data.data;
}

// Get today's date in YYYY-MM-DD format
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Appointments Hook
export function useAppointments(date?: string) {
  const selectedDate = date || getTodayString();
  
  return useQuery({
    queryKey: ['appointments', selectedDate],
    queryFn: () => fetchAppointments(selectedDate),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

// Today's Appointments Hook
export function useTodayAppointments() {
  return useAppointments(getTodayString());
}

// Filtered Appointments Hook
export function useFilteredAppointments(date?: string, filters?: AppointmentFilters) {
  const { data: appointments, ...rest } = useAppointments(date);
  
  const filteredData = appointments?.filter(appointment => {
    if (!filters) return true;
    
    // Filter by dentist IDs
    if (filters.dentistIds?.length && !filters.dentistIds.includes(appointment.dentist.id)) {
      return false;
    }
    
    // Filter by room IDs
    if (filters.roomIds?.length && appointment.room && !filters.roomIds.includes(appointment.room.id)) {
      return false;
    }
    
    // Filter by status
    if (filters.status?.length && !filters.status.includes(appointment.status)) {
      return false;
    }
    
    // Filter by priority
    if (filters.priority?.length && !filters.priority.includes(appointment.priority)) {
      return false;
    }
    
    // Filter by search term (patient name, dentist name)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`.toLowerCase();
      const dentistName = appointment.dentist.name.toLowerCase();
      const procedureName = appointment.procedure.name.toLowerCase();
      
      if (!patientName.includes(searchLower) && 
          !dentistName.includes(searchLower) && 
          !procedureName.includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });

  return {
    data: filteredData,
    ...rest
  };
}

// Appointment by ID Hook
export function useAppointment(id: string | undefined) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => {
      // First check if we have the appointment in cache from appointments list
      const today = getTodayString();
      const appointmentsData = queryClient.getQueryData(['appointments', today]) as Appointment[];
      
      if (appointmentsData) {
        const appointment = appointmentsData.find(apt => apt.id === id);
        if (appointment) return appointment;
      }
      
      // If not found in cache, you could implement a specific endpoint
      // For now, we'll throw an error since the spec doesn't include individual appointment endpoints
      throw new Error('Appointment not found');
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

// Appointment Statistics Hook
export function useAppointmentStats(date?: string) {
  const { data: appointments } = useAppointments(date);
  
  const stats = appointments ? {
    total: appointments.length,
    scheduled: appointments.filter(apt => apt.status === 'scheduled').length,
    checkedIn: appointments.filter(apt => apt.status === 'checked_in').length,
    inProgress: appointments.filter(apt => apt.status === 'in_progress').length,
    completed: appointments.filter(apt => apt.status === 'completed').length,
    cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
    noShow: appointments.filter(apt => apt.status === 'no_show').length,
    urgent: appointments.filter(apt => apt.priority === 'urgent' || apt.priority === 'emergency').length,
    byDentist: appointments.reduce((acc, apt) => {
      const dentistName = apt.dentist.name;
      acc[dentistName] = (acc[dentistName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byProcedure: appointments.reduce((acc, apt) => {
      acc[apt.procedure.name] = (acc[apt.procedure.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byTimeSlot: appointments.reduce((acc, apt) => {
      const scheduledDate = new Date(apt.scheduledStart);
      const hour = scheduledDate.getHours();
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      acc[timeSlot] = (acc[timeSlot] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  } : null;
  
  return stats;
}