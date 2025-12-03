import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NowServing, NowServingRequest } from '@/lib/domain';

// API functions
async function fetchNowServing(): Promise<NowServing[]> {
  const response = await fetch('/api/alerts/now-serving');
  if (!response.ok) {
    throw new Error('Failed to fetch now serving events');
  }
  const data = await response.json();
  return data.data || [];
}

async function createNowServing(request: NowServingRequest): Promise<NowServing> {
  const response = await fetch('/api/alerts/now-serving', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create now serving alert');
  }
  
  const data = await response.json();
  return data.data;
}

// Hooks
export function useNowServing() {
  return useQuery({
    queryKey: ['now-serving'],
    queryFn: fetchNowServing,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // 5 seconds
  });
}

export function useCreateNowServing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createNowServing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['now-serving'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] }); // Also update queue
    },
  });
}