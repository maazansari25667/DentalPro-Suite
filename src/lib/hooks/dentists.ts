import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dentist, DentistAvailability } from '@/lib/domain';
import { DentistFormData, DentistAvailabilityFormData } from '@/lib/validations/clinical';

// API functions for dentists
const fetchDentists = async (params?: {
  specialty?: string;
  active?: boolean;
  q?: string;
}) => {
  const searchParams = new URLSearchParams();
  
  if (params?.specialty) searchParams.set('specialty', params.specialty);
  if (params?.active !== undefined) searchParams.set('active', String(params.active));
  if (params?.q) searchParams.set('q', params.q);
  
  const response = await fetch(`/api/dentists?${searchParams.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch dentists');
  
  const result = await response.json();
  return result.data;
};

const fetchDentist = async (id: string) => {
  const response = await fetch(`/api/dentists/${id}`);
  if (!response.ok) throw new Error('Failed to fetch dentist');
  
  const result = await response.json();
  return result.data;
};

const createDentist = async (data: DentistFormData) => {
  const response = await fetch('/api/dentists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to create dentist');
  
  const result = await response.json();
  return result.data;
};

const updateDentist = async ({ id, data }: { id: string; data: Partial<DentistFormData> }) => {
  const response = await fetch(`/api/dentists/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to update dentist');
  
  const result = await response.json();
  return result.data;
};

const fetchDentistAvailability = async (id: string) => {
  const response = await fetch(`/api/dentists/${id}/availability`);
  if (!response.ok) throw new Error('Failed to fetch dentist availability');
  
  const result = await response.json();
  return result.data;
};

const updateDentistAvailability = async ({ 
  id, 
  data 
}: { 
  id: string; 
  data: DentistAvailabilityFormData 
}) => {
  const response = await fetch(`/api/dentists/${id}/availability`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to update dentist availability');
  
  const result = await response.json();
  return result.data;
};

// React Query hooks for dentists
export const useDentists = (params?: {
  specialty?: string;
  active?: boolean;
  q?: string;
}) => {
  return useQuery({
    queryKey: ['dentists', params],
    queryFn: () => fetchDentists(params),
    staleTime: 1000 * 60 * 10, // 10 minutes (dentist data doesn't change often)
  });
};

export const useDentist = (id: string) => {
  return useQuery({
    queryKey: ['dentists', id],
    queryFn: () => fetchDentist(id),
    enabled: !!id,
  });
};

export const useCreateDentist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDentist,
    onSuccess: (newDentist) => {
      // Update the dentists list optimistically
      queryClient.setQueryData<Dentist[]>(['dentists'], (old) => {
        return old ? [...old, newDentist] : [newDentist];
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['dentists'] });
    },
    onError: (error) => {
      console.error('Failed to create dentist:', error);
    },
  });
};

export const useUpdateDentist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateDentist,
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['dentists'] });
      
      // Snapshot previous values
      const previousDentists = queryClient.getQueryData<Dentist[]>(['dentists']);
      const previousDentist = queryClient.getQueryData<Dentist>(['dentists', id]);
      
      // Optimistically update
      if (previousDentists) {
        queryClient.setQueryData<Dentist[]>(['dentists'], 
          previousDentists.map(dentist => 
            dentist.id === id ? { ...dentist, ...data } : dentist
          )
        );
      }
      
      if (previousDentist) {
        queryClient.setQueryData<Dentist>(['dentists', id], 
          { ...previousDentist, ...data }
        );
      }
      
      return { previousDentists, previousDentist };
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousDentists) {
        queryClient.setQueryData(['dentists'], context.previousDentists);
      }
      if (context?.previousDentist) {
        queryClient.setQueryData(['dentists', id], context.previousDentist);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['dentists'] });
    },
  });
};

export const useDentistAvailability = (id: string) => {
  return useQuery({
    queryKey: ['dentists', id, 'availability'],
    queryFn: () => fetchDentistAvailability(id),
    enabled: !!id,
  });
};

export const useUpsertDentistAvailability = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: DentistAvailabilityFormData) => 
      updateDentistAvailability({ id, data }),
    onSuccess: (updatedAvailability) => {
      // Update the availability cache
      queryClient.setQueryData(['dentists', id, 'availability'], updatedAvailability);
      
      // Also invalidate appointments since availability affects scheduling
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      console.error('Failed to update dentist availability:', error);
    },
  });
};

// Utility hooks
export const useActiveDentists = () => {
  return useDentists({ active: true });
};

export const useDentistsBySpecialty = (specialty: string) => {
  return useDentists({ specialty, active: true });
};

// Filtering hook
export const useFilteredDentists = (params?: {
  specialty?: string;
  active?: boolean;
  q?: string;
}) => {
  return useDentists(params);
};

// Get dentist utilization data
export const useDentistUtilization = (dentistId: string, date?: string) => {
  return useQuery({
    queryKey: ['dentists', dentistId, 'utilization', date],
    queryFn: async () => {
      // This would calculate utilization based on appointments for the dentist
      // For now, return mock data
      return {
        totalMinutes: 480, // 8 hours
        bookedMinutes: 360, // 6 hours
        utilization: 0.75, // 75%
        appointments: 8,
        completedAppointments: 6,
      };
    },
    enabled: !!dentistId,
  });
};