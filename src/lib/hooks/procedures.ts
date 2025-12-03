import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Procedure } from '@/lib/domain';
import { ProcedureFormData } from '@/lib/validations/clinical';

// API functions for procedures
const fetchProcedures = async (params?: {
  category?: string;
  active?: boolean;
  q?: string;
}) => {
  const searchParams = new URLSearchParams();
  
  if (params?.category) searchParams.set('category', params.category);
  if (params?.active !== undefined) searchParams.set('active', String(params.active));
  if (params?.q) searchParams.set('q', params.q);
  
  const response = await fetch(`/api/procedures?${searchParams.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch procedures');
  
  const result = await response.json();
  return result.data;
};

const fetchProcedure = async (code: string) => {
  const response = await fetch(`/api/procedures/${code}`);
  if (!response.ok) throw new Error('Failed to fetch procedure');
  
  const result = await response.json();
  return result.data;
};

const createProcedure = async (data: ProcedureFormData) => {
  const response = await fetch('/api/procedures', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('Procedure code already exists');
    }
    throw new Error('Failed to create procedure');
  }
  
  const result = await response.json();
  return result.data;
};

const updateProcedure = async ({ code, data }: { code: string; data: Partial<ProcedureFormData> }) => {
  const response = await fetch(`/api/procedures/${code}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('Procedure code already exists');
    }
    throw new Error('Failed to update procedure');
  }
  
  const result = await response.json();
  return result.data;
};

const deleteProcedure = async (code: string) => {
  const response = await fetch(`/api/procedures/${code}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) throw new Error('Failed to delete procedure');
  
  return { success: true };
};

// React Query hooks for procedures
export const useProcedures = (params?: {
  category?: string;
  active?: boolean;
  q?: string;
}) => {
  return useQuery({
    queryKey: ['procedures', params],
    queryFn: () => fetchProcedures(params),
    staleTime: 1000 * 60 * 10, // 10 minutes (procedures don't change often)
  });
};

export const useProcedure = (code: string) => {
  return useQuery({
    queryKey: ['procedures', code],
    queryFn: () => fetchProcedure(code),
    enabled: !!code,
  });
};

export const useCreateProcedure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProcedure,
    onSuccess: (newProcedure) => {
      // Update the procedures list optimistically
      queryClient.setQueryData<Procedure[]>(['procedures'], (old) => {
        return old ? [...old, newProcedure] : [newProcedure];
      });
      
      // Invalidate and refetch all procedures queries
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
    },
    onError: (error) => {
      console.error('Failed to create procedure:', error);
    },
  });
};

export const useUpdateProcedure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProcedure,
    onMutate: async ({ code, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['procedures'] });
      
      // Snapshot previous values
      const previousProcedures = queryClient.getQueryData<Procedure[]>(['procedures']);
      const previousProcedure = queryClient.getQueryData<Procedure>(['procedures', code]);
      
      // Optimistically update
      if (previousProcedures) {
        queryClient.setQueryData<Procedure[]>(['procedures'], 
          previousProcedures.map(procedure => 
            procedure.code === code ? { ...procedure, ...data } : procedure
          )
        );
      }
      
      if (previousProcedure) {
        queryClient.setQueryData<Procedure>(['procedures', code], 
          { ...previousProcedure, ...data }
        );
      }
      
      return { previousProcedures, previousProcedure };
    },
    onError: (error, { code }, context) => {
      // Rollback on error
      if (context?.previousProcedures) {
        queryClient.setQueryData(['procedures'], context.previousProcedures);
      }
      if (context?.previousProcedure) {
        queryClient.setQueryData(['procedures', code], context.previousProcedure);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
    },
  });
};

export const useDeleteProcedure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProcedure,
    onMutate: async (code) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['procedures'] });
      
      // Snapshot previous value
      const previousProcedures = queryClient.getQueryData<Procedure[]>(['procedures']);
      
      // Optimistically remove
      if (previousProcedures) {
        queryClient.setQueryData<Procedure[]>(['procedures'], 
          previousProcedures.filter(procedure => procedure.code !== code)
        );
      }
      
      return { previousProcedures };
    },
    onError: (error, code, context) => {
      // Rollback on error
      if (context?.previousProcedures) {
        queryClient.setQueryData(['procedures'], context.previousProcedures);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
    },
  });
};

// Utility hooks
export const useActiveProcedures = () => {
  return useProcedures({ active: true });
};

export const useProceduresByCategory = (category: string) => {
  return useProcedures({ category, active: true });
};

// Filtering hook
export const useFilteredProcedures = (params?: {
  category?: string;
  active?: boolean;
  q?: string;
}) => {
  return useProcedures(params);
};

// Get procedure usage statistics
export const useProcedureUsage = (procedureCode: string, timeframe?: '7d' | '30d' | '90d') => {
  return useQuery({
    queryKey: ['procedures', procedureCode, 'usage', timeframe || '30d'],
    queryFn: async () => {
      // This would fetch real usage statistics from appointments
      // For now, return mock data
      return {
        totalAppointments: 45,
        completedAppointments: 38,
        cancelledAppointments: 4,
        noShowAppointments: 3,
        averageDuration: 30,
        totalRevenue: 1500,
        successRate: 0.84, // 84%
      };
    },
    enabled: !!procedureCode,
  });
};

// Get procedure categories for filtering
export const useProcedureCategories = () => {
  return useQuery({
    queryKey: ['procedures', 'categories'],
    queryFn: async () => {
      const procedures = await fetchProcedures({ active: true });
      const categories = [...new Set(procedures.map((p: Procedure) => p.category))];
      return categories.sort();
    },
  });
};

// Get most popular procedures
export const usePopularProcedures = (limit: number = 10) => {
  return useQuery({
    queryKey: ['procedures', 'popular', limit],
    queryFn: async () => {
      // This would be calculated based on appointment data
      // For now, return mock data
      const procedures = await fetchProcedures({ active: true });
      return procedures.slice(0, limit).map((procedure: Procedure) => ({
        ...procedure,
        appointmentCount: Math.floor(Math.random() * 100),
        revenue: Math.floor(Math.random() * 10000),
      }));
    },
  });
};