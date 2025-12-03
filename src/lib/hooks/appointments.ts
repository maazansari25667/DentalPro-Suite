import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Appointment, AppointmentFormInput, AppointmentStatus } from '@/lib/domain';

// API functions for appointments
const fetchAppointments = async (params?: {
  from?: string;
  to?: string;
  dentistId?: string;
  roomId?: string;
  status?: string;
  q?: string;
}) => {
  const searchParams = new URLSearchParams();
  
  if (params?.from) searchParams.set('from', params.from);
  if (params?.to) searchParams.set('to', params.to);
  if (params?.dentistId) searchParams.set('dentistId', params.dentistId);
  if (params?.roomId) searchParams.set('roomId', params.roomId);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.q) searchParams.set('q', params.q);
  
  const response = await fetch(`/api/appointments?${searchParams.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch appointments');
  
  const result = await response.json();
  return result.data;
};

const fetchAppointment = async (id: string) => {
  const response = await fetch(`/api/appointments/${id}`);
  if (!response.ok) throw new Error('Failed to fetch appointment');
  
  const result = await response.json();
  return result.data;
};

const createAppointment = async (data: AppointmentFormInput) => {
  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    if (response.status === 409) {
      throw new Error(JSON.stringify(error)); // Conflict error with details
    }
    throw new Error('Failed to create appointment');
  }
  
  const result = await response.json();
  return result.data;
};

const updateAppointment = async ({ id, data }: { 
  id: string; 
  data: Partial<AppointmentFormInput> | { status?: AppointmentStatus; notes?: string }
}) => {
  const response = await fetch(`/api/appointments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    if (response.status === 409) {
      throw new Error(JSON.stringify(error)); // Conflict error
    }
    throw new Error('Failed to update appointment');
  }
  
  const result = await response.json();
  return result.data;
};

const updateAppointmentStatus = async ({ id, status, notes }: { 
  id: string; 
  status: AppointmentStatus; 
  notes?: string 
}) => {
  return updateAppointment({ id, data: { status, notes } });
};

const deleteAppointment = async (id: string) => {
  const response = await fetch(`/api/appointments/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) throw new Error('Failed to delete appointment');
  
  const result = await response.json();
  return result;
};

// React Query hooks
export const useAppointments = (params?: {
  from?: string;
  to?: string;
  dentistId?: string;
  roomId?: string;
  status?: string;
  q?: string;
}) => {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => fetchAppointments(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAppointment = (id: string) => {
  return useQuery({
    queryKey: ['appointments', id],
    queryFn: () => fetchAppointment(id),
    enabled: !!id,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAppointment,
    onSuccess: (newAppointment) => {
      // Update the appointments list optimistically
      queryClient.setQueryData<Appointment[]>(['appointments'], (old) => {
        return old ? [...old, newAppointment] : [newAppointment];
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      console.error('Failed to create appointment:', error);
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateAppointment,
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['appointments'] });
      
      // Snapshot previous values
      const previousAppointments = queryClient.getQueryData<Appointment[]>(['appointments']);
      const previousAppointment = queryClient.getQueryData<Appointment>(['appointments', id]);
      
      // Optimistically update
      if (previousAppointments) {
        queryClient.setQueryData<Appointment[]>(['appointments'], 
          previousAppointments.map(apt => 
            apt.id === id ? { ...apt, ...data } : apt
          )
        );
      }
      
      if (previousAppointment) {
        queryClient.setQueryData<Appointment>(['appointments', id], 
          { ...previousAppointment, ...data }
        );
      }
      
      return { previousAppointments, previousAppointment };
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousAppointments) {
        queryClient.setQueryData(['appointments'], context.previousAppointments);
      }
      if (context?.previousAppointment) {
        queryClient.setQueryData(['appointments', id], context.previousAppointment);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateAppointmentStatus,
    onSuccess: (updatedAppointment) => {
      // Update the appointments list
      queryClient.setQueryData<Appointment[]>(['appointments'], (old) => {
        return old ? old.map(apt => 
          apt.id === updatedAppointment.id ? updatedAppointment : apt
        ) : [updatedAppointment];
      });
      
      // Update the individual appointment
      queryClient.setQueryData(['appointments', updatedAppointment.id], updatedAppointment);
      
      // If status changed to checked_in, invalidate queue data
      if (updatedAppointment.status === 'checked_in') {
        queryClient.invalidateQueries({ queryKey: ['queue'] });
      }
    },
    onError: (error) => {
      console.error('Failed to update appointment status:', error);
    },
  });
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAppointment,
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['appointments'] });
      
      // Snapshot previous value
      const previousAppointments = queryClient.getQueryData<Appointment[]>(['appointments']);
      
      // Optimistically update
      if (previousAppointments) {
        queryClient.setQueryData<Appointment[]>(['appointments'], 
          previousAppointments.filter(apt => apt.id !== id)
        );
      }
      
      return { previousAppointments };
    },
    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousAppointments) {
        queryClient.setQueryData(['appointments'], context.previousAppointments);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

// Filtering hook
export const useFilteredAppointments = (params?: {
  from?: string;
  to?: string;
  dentistId?: string;
  roomId?: string;
  status?: string;
  q?: string;
}) => {
  return useAppointments(params);
};

// Bulk operations
export const useBulkUpdateAppointments = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      appointmentIds, 
      action, 
      data 
    }: { 
      appointmentIds: string[]; 
      action: 'cancel' | 'mark_no_show' | 'reschedule';
      data?: any;
    }) => {
      const promises = appointmentIds.map(id => {
        const updateData = action === 'cancel' ? { status: 'cancelled' } :
                          action === 'mark_no_show' ? { status: 'no_show' } :
                          data; // reschedule data
        
        return updateAppointment({ id, data: updateData });
      });
      
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};