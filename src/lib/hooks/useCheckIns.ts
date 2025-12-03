import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckIn, CreateCheckInRequest, CheckInFilters, VisitStatus } from '@/lib/domain';

// API functions
async function fetchCheckIns(date?: string): Promise<CheckIn[]> {
  const url = new URL('/api/checkins', window.location.origin);
  if (date) {
    url.searchParams.set('date', date);
  }
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch check-ins');
  }
  const data = await response.json();
  return data.data;
}

async function createCheckIn(checkInData: CreateCheckInRequest): Promise<CheckIn> {
  const response = await fetch('/api/checkins', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(checkInData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create check-in');
  }
  
  const data = await response.json();
  return data.data;
}

// Get today's date in YYYY-MM-DD format
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Check-ins Hook
export function useCheckIns(date?: string) {
  const selectedDate = date || getTodayString();
  
  return useQuery({
    queryKey: ['checkins', selectedDate],
    queryFn: () => fetchCheckIns(selectedDate),
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
}

// Today's Check-ins Hook
export function useTodayCheckIns() {
  return useCheckIns(getTodayString());
}

// Filtered Check-ins Hook
export function useFilteredCheckIns(date?: string, filters?: CheckInFilters) {
  const { data: checkIns, ...rest } = useCheckIns(date);
  
  const filteredData = checkIns?.filter(checkIn => {
    if (!filters) return true;
    
    // Filter by status
    if (filters.status?.length && !filters.status.includes(checkIn.status)) {
      return false;
    }
    
    // Filter by walk-in status
    if (filters.isWalkIn !== undefined && checkIn.isWalkIn !== filters.isWalkIn) {
      return false;
    }
    
    // Filter by priority
    if (filters.priority?.length && !filters.priority.includes(checkIn.priority)) {
      return false;
    }
    
    // Filter by search term (patient name, reason)
    if (filters.search && checkIn.patient) {
      const searchLower = filters.search.toLowerCase();
      const patientName = `${checkIn.patient.firstName} ${checkIn.patient.lastName}`.toLowerCase();
      const reason = checkIn.reasonForVisit.toLowerCase();
      
      if (!patientName.includes(searchLower) && !reason.includes(searchLower)) {
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

// Create Check-in Mutation
export function useCreateCheckIn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCheckIn,
    onMutate: async (newCheckIn) => {
      // Cancel any outgoing refetches
      const today = getTodayString();
      await queryClient.cancelQueries({ queryKey: ['checkins', today] });
      
      // Snapshot the previous value
      const previousCheckIns = queryClient.getQueryData(['checkins', today]);
      
      // Optimistically update to the new value
      const optimisticCheckIn: CheckIn = {
        id: `temp-${Date.now()}`,
        appointmentId: newCheckIn.patientId ? undefined : undefined,
        patient: newCheckIn.walkInPatient ? {
          id: `temp-patient-${Date.now()}`,
          ...newCheckIn.walkInPatient,
        } : {
          id: newCheckIn.patientId!,
          firstName: 'Unknown',
          lastName: 'Patient',
          phoneNumber: '(555) 000-0000',
          dateOfBirth: '1990-01-01',
          gender: 'other' as any,
        },
        checkInTime: new Date().toISOString(),
        priority: newCheckIn.priority,
        reasonForVisit: newCheckIn.reasonForVisit,
        isWalkIn: newCheckIn.isWalkIn,
        symptoms: newCheckIn.symptoms,
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
      
      queryClient.setQueryData(['checkins', today], (old: CheckIn[] = []) => [
        optimisticCheckIn,
        ...old
      ]);
      
      return { previousCheckIns };
    },
    onError: (err, newCheckIn, context) => {
      // Rollback on error
      const today = getTodayString();
      queryClient.setQueryData(['checkins', today], context?.previousCheckIns);
    },
    onSuccess: () => {
      // Invalidate and refetch
      const today = getTodayString();
      queryClient.invalidateQueries({ queryKey: ['checkins', today] });
    },
  });
}

// Check-in Statistics Hook
export function useCheckInStats(date?: string) {
  const { data: checkIns } = useCheckIns(date);
  
  const stats = checkIns ? {
    total: checkIns.length,
    walkIns: checkIns.filter(ci => ci.isWalkIn).length,
    scheduled: checkIns.filter(ci => !ci.isWalkIn).length,
    checkedIn: checkIns.filter(ci => ci.status === 'checked_in').length,
    inProgress: checkIns.filter(ci => ci.status === 'in_progress').length,
    completed: checkIns.filter(ci => ci.status === 'completed').length,
    urgent: checkIns.filter(ci => ci.priority === 'urgent' || ci.priority === 'emergency').length,
    pendingInsurance: checkIns.filter(ci => !ci.insuranceVerified).length,
    pendingConsent: checkIns.filter(ci => !ci.consentSigned).length,
    averageWaitTime: checkIns.reduce((sum, ci) => sum + (ci.estimatedWaitTime || 0), 0) / checkIns.length || 0,
    byPriority: checkIns.reduce((acc, ci) => {
      acc[ci.priority] = (acc[ci.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byReason: checkIns.reduce((acc, ci) => {
      acc[ci.reasonForVisit] = (acc[ci.reasonForVisit] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    checkInsByHour: checkIns.reduce((acc, ci) => {
      const hour = new Date(ci.checkInTime).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>),
  } : null;
  
  return stats;
}